import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { setupWSConnection } from 'y-websocket/bin/utils';
import { processAgentRequest } from './orchestrator.js';
import { handleMcpJsonRpc, REGAARDER_MCP_TOOLS } from './mcpTools.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USERS_FILE = path.join(__dirname, 'users.json');

// Initialize users database file
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2), 'utf8');
}

function readUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

const hashPassword = (password) => crypto.createHash('sha256').update(password).digest('hex');

// In-memory active session store (token -> user)
const activeSessions = new Map();

const app = express();
app.use(cors());
app.use(express.json());

// Model Context Protocol (MCP) Endpoints
app.post('/api/mcp', handleMcpJsonRpc);
app.get('/api/mcp/tools', (req, res) => {
  res.json({
    tools: REGAARDER_MCP_TOOLS.map(t => ({
      name: t.name,
      description: t.description,
      inputSchema: toStandardJsonSchema(t.parameters)
    }))
  });
});

// API Auth Routes
app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const users = readUsers();
  const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ message: 'Email already registered.' });
  }

  const newUser = {
    id: 'user_' + Date.now(),
    email: email.toLowerCase(),
    name,
    passwordHash: hashPassword(password),
    provider: 'email',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeUsers(users);

  // Auto-generate token on signup
  const token = 'session_' + crypto.randomBytes(24).toString('hex');
  const userResponse = { id: newUser.id, email: newUser.email, name: newUser.name, provider: 'email' };
  activeSessions.set(token, userResponse);

  res.status(201).json({ token, user: userResponse });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const users = readUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = 'session_' + crypto.randomBytes(24).toString('hex');
  const userResponse = { id: user.id, email: user.email, name: user.name, provider: 'email' };
  activeSessions.set(token, userResponse);

  res.json({ token, user: userResponse });
});

app.post('/api/auth/social', (req, res) => {
  const { provider, email, name } = req.body;
  if (!provider || !email || !name) {
    return res.status(400).json({ message: 'Missing social profile fields.' });
  }

  const users = readUsers();
  let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    // Create new user for social signup
    user = {
      id: 'user_' + Date.now(),
      email: email.toLowerCase(),
      name,
      provider,
      createdAt: new Date().toISOString()
    };
    users.push(user);
    writeUsers(users);
  }

  const token = 'session_' + crypto.randomBytes(24).toString('hex');
  const userResponse = { id: user.id, email: user.email, name: user.name, provider };
  activeSessions.set(token, userResponse);

  res.json({ token, user: userResponse });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No authorization token provided.' });
  }

  const token = authHeader.split(' ')[1];
  const user = activeSessions.get(token);

  if (!user) {
    return res.status(401).json({ message: 'Session expired or invalid.' });
  }

  res.json({ user });
});

// --- SQLite Database Setup ---
let db;
(async () => {
  db = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      date TEXT,
      title TEXT,
      link TEXT,
      time TEXT,
      description TEXT,
      privacy TEXT,
      recurrence TEXT
    );
    CREATE TABLE IF NOT EXISTS invites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      sender TEXT,
      title TEXT,
      date TEXT,
      time TEXT,
      status TEXT DEFAULT 'pending'
    );
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT,
      subtitle TEXT,
      content TEXT,
      initiatives TEXT,
      appended_sections TEXT,
      is_blank INTEGER DEFAULT 1,
      created_at TEXT,
      updated_at TEXT
    );
  `);
})();

// Authentication middleware for Meetings/Invites
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  const user = activeSessions.get(token);
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  req.user = user;
  next();
};

// --- Meetings / Events API ---
app.get('/api/events', requireAuth, async (req, res) => {
  try {
    const events = await db.all('SELECT * FROM events WHERE user_id = ?', [req.user.id]);
    
    // Group events by date format: { 'YYYY-MM-DD': [{ title, link, ... }] }
    const groupedEvents = {};
    events.forEach(e => {
      if (!groupedEvents[e.date]) groupedEvents[e.date] = [];
      groupedEvents[e.date].push(e);
    });
    
    res.json(groupedEvents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/events', requireAuth, async (req, res) => {
  const { date, title, link, time, description, privacy, recurrence, guests } = req.body;
  if (!date || !title) return res.status(400).json({ error: 'Date and Title are required' });

  try {
    const result = await db.run(
      'INSERT INTO events (user_id, date, title, link, time, description, privacy, recurrence) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, date, title, link || '', time || '', description || '', privacy || 'private', recurrence || 'none']
    );
    
    // Simulate sending invites
    if (guests && guests.length > 0) {
      // In a real app we'd map guest emails to user_ids, but for now we'll just insert an invite for the current user 
      // or a mock target so it shows up in their notifications if they invite themselves for testing
      for (const guest of guests) {
        // Here we just attach it to the current user so they can test it!
        await db.run(
          'INSERT INTO invites (user_id, sender, title, date, time) VALUES (?, ?, ?, ?, ?)',
          [req.user.id, 'You (To: ' + guest + ')', title, date, time || '']
        );
      }
    }
    
    res.status(201).json({ id: result.lastID, date, title, link, time, description, privacy, recurrence });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Invites API ---
app.get('/api/invites', requireAuth, async (req, res) => {
  try {
    const invites = await db.all('SELECT * FROM invites WHERE user_id = ? AND status = ?', [req.user.id, 'pending']);
    res.json(invites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/invites/:id/accept', requireAuth, async (req, res) => {
  try {
    const invite = await db.get('SELECT * FROM invites WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!invite) return res.status(404).json({ error: 'Invite not found' });
    
    // Create an event for the user
    await db.run(
      'INSERT INTO events (user_id, date, title, link, time) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, invite.date, invite.title, '', invite.time]
    );
    
    // Mark as accepted (or delete it)
    await db.run('DELETE FROM invites WHERE id = ?', [req.params.id]);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/invites/:id', requireAuth, async (req, res) => {
  try {
    await db.run('DELETE FROM invites WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Documents API ---
const formatDocResponse = (doc) => {
  if (!doc) return null;
  let parsedInitiatives = [];
  let parsedSections = [];
  try {
    parsedInitiatives = doc.initiatives ? JSON.parse(doc.initiatives) : [];
  } catch (e) {
    parsedInitiatives = [];
  }
  try {
    parsedSections = doc.appended_sections ? JSON.parse(doc.appended_sections) : [];
  } catch (e) {
    parsedSections = [];
  }
  return {
    id: doc.id,
    user_id: doc.user_id,
    title: doc.title || '',
    subtitle: doc.subtitle || '',
    bodyHtml: doc.content || '',
    content: doc.content || '',
    initiatives: parsedInitiatives,
    appendedSections: parsedSections,
    isBlank: Boolean(doc.is_blank),
    createdAt: doc.created_at,
    updatedAt: doc.updated_at
  };
};

app.get('/api/documents', requireAuth, async (req, res) => {
  try {
    const docs = await db.all('SELECT * FROM documents WHERE user_id = ? ORDER BY updated_at DESC', [req.user.id]);
    res.json(docs.map(formatDocResponse));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/documents/:id', requireAuth, async (req, res) => {
  try {
    const doc = await db.get('SELECT * FROM documents WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json(formatDocResponse(doc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/documents', requireAuth, async (req, res) => {
  const { id, title, subtitle, content, bodyHtml, initiatives, appendedSections, isBlank } = req.body;
  const docId = String(id || 'doc_' + Date.now());
  const docContent = bodyHtml !== undefined ? bodyHtml : (content || '');
  const initiativesStr = JSON.stringify(initiatives || []);
  const sectionsStr = JSON.stringify(appendedSections || []);
  const isBlankVal = isBlank ? 1 : 0;
  const now = new Date().toISOString();

  try {
    const existing = await db.get('SELECT id FROM documents WHERE id = ? AND user_id = ?', [docId, req.user.id]);
    if (existing) {
      await db.run(
        `UPDATE documents SET 
          title = ?, subtitle = ?, content = ?, initiatives = ?, appended_sections = ?, is_blank = ?, updated_at = ?
         WHERE id = ? AND user_id = ?`,
        [title || '', subtitle || '', docContent, initiativesStr, sectionsStr, isBlankVal, now, docId, req.user.id]
      );
    } else {
      await db.run(
        `INSERT INTO documents 
          (id, user_id, title, subtitle, content, initiatives, appended_sections, is_blank, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [docId, req.user.id, title || '', subtitle || '', docContent, initiativesStr, sectionsStr, isBlankVal, now, now]
      );
    }

    const savedDoc = await db.get('SELECT * FROM documents WHERE id = ? AND user_id = ?', [docId, req.user.id]);
    res.status(201).json(formatDocResponse(savedDoc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/documents/:id', requireAuth, async (req, res) => {
  const docId = String(req.params.id);
  const { title, subtitle, content, bodyHtml, initiatives, appendedSections, isBlank } = req.body;
  const docContent = bodyHtml !== undefined ? bodyHtml : (content || '');
  const initiativesStr = JSON.stringify(initiatives || []);
  const sectionsStr = JSON.stringify(appendedSections || []);
  const isBlankVal = isBlank ? 1 : 0;
  const now = new Date().toISOString();

  try {
    const existing = await db.get('SELECT id FROM documents WHERE id = ? AND user_id = ?', [docId, req.user.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Document not found' });
    }

    await db.run(
      `UPDATE documents SET 
        title = ?, subtitle = ?, content = ?, initiatives = ?, appended_sections = ?, is_blank = ?, updated_at = ?
       WHERE id = ? AND user_id = ?`,
      [title || '', subtitle || '', docContent, initiativesStr, sectionsStr, isBlankVal, now, docId, req.user.id]
    );

    const updatedDoc = await db.get('SELECT * FROM documents WHERE id = ? AND user_id = ?', [docId, req.user.id]);
    res.json(formatDocResponse(updatedDoc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/documents/:id', requireAuth, async (req, res) => {
  try {
    const result = await db.run('DELETE FROM documents WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const server = http.createServer(app);

// Existing Socket.IO for AI Orchestration
const io = new Server(server, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log('Socket.IO Client connected:', socket.id);

  socket.on('start_agent_task', async (data) => {
    const { intent, context } = data;
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_DEMO_API_KEY;
    
    if (!apiKey) {
      socket.emit('agent_error', { message: 'API Key missing on server environment.' });
      return;
    }

    try {
      await processAgentRequest(socket, intent, context, apiKey);
    } catch (err) {
      console.error(err);
      socket.emit('agent_error', { message: err.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket.IO Client disconnected:', socket.id);
  });
});

// Yjs WebSocket Server for Real-Time Collaboration
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws, req) => {
  console.log('Yjs WebSocket Client connected');
  setupWSConnection(ws, req);
});

server.on('upgrade', (request, socket, head) => {
  const pathname = request.url;
  // Route Yjs connections to the WebSocket Server
  if (pathname.startsWith('/yjs')) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
  // Otherwise, do not destroy the socket; Socket.io will handle it implicitly if it matches its path
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Agent OS Backend running on port ${PORT}`);
  console.log(`Yjs Collaboration Server running on ws://localhost:${PORT}/yjs`);
});
