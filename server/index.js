import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { setupWSConnection } from 'y-websocket/bin/utils';
import { 
  handleMcpJsonRpc, 
  processMcpRequest, 
  REGAARDER_MCP_TOOLS, 
  REGAARDER_MCP_RESOURCES, 
  REGAARDER_MCP_PROMPTS, 
  toStandardJsonSchema 
} from './mcpTools.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USERS_FILE = path.join(__dirname, 'users.json');

// --- In-Memory Active Session Cache (token -> user) ---
const activeSessions = new Map();

// --- Secure Scrypt Password Hashing with Legacy SHA-256 Migration ---
const hashPassword = async (password) => {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`scrypt:${salt}:${derivedKey.toString('hex')}`);
    });
  });
};

const verifyPassword = async (password, storedHash) => {
  if (!storedHash || typeof storedHash !== 'string') return { valid: false, shouldUpgrade: false };

  // Modern salted scrypt verification
  if (storedHash.startsWith('scrypt:')) {
    const parts = storedHash.split(':');
    if (parts.length !== 3) return { valid: false, shouldUpgrade: false };
    const [, salt, key] = parts;
    return new Promise((resolve) => {
      crypto.scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) return resolve({ valid: false, shouldUpgrade: false });
        const keyBuffer = Buffer.from(key, 'hex');
        if (derivedKey.length !== keyBuffer.length) return resolve({ valid: false, shouldUpgrade: false });
        const isValid = crypto.timingSafeEqual(derivedKey, keyBuffer);
        resolve({ valid: isValid, shouldUpgrade: false });
      });
    });
  }

  // Legacy SHA-256 backward-compatibility with timing-safe comparison
  const legacyHash = crypto.createHash('sha256').update(password).digest('hex');
  if (legacyHash.length === storedHash.length) {
    const isValid = crypto.timingSafeEqual(Buffer.from(legacyHash), Buffer.from(storedHash));
    return { valid: isValid, shouldUpgrade: isValid };
  }

  return { valid: false, shouldUpgrade: false };
};

// --- SQLite Database Setup & User Migration ---
let db;
const initDatabase = async () => {
  db = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  await db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT,
      provider TEXT DEFAULT 'email',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at INTEGER,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

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

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_events_user ON events(user_id);
    CREATE INDEX IF NOT EXISTS idx_invites_user_status ON invites(user_id, status);
    CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id, updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
  `);

  // Migrate legacy users.json into SQLite if present
  try {
    if (fs.existsSync(USERS_FILE)) {
      const fileData = fs.readFileSync(USERS_FILE, 'utf8');
      const legacyUsers = JSON.parse(fileData);
      if (Array.isArray(legacyUsers) && legacyUsers.length > 0) {
        for (const u of legacyUsers) {
          const existing = await db.get('SELECT id FROM users WHERE email = ?', [u.email.toLowerCase()]);
          if (!existing) {
            await db.run(
              'INSERT INTO users (id, email, name, password_hash, provider, created_at) VALUES (?, ?, ?, ?, ?, ?)',
              [u.id, u.email.toLowerCase(), u.name || 'User', u.passwordHash || null, u.provider || 'email', u.createdAt || new Date().toISOString()]
            );
          }
        }
      }
    }
  } catch (err) {
    console.warn('[DB Init] Error migrating legacy users.json:', err.message);
  }

  // Load existing persistent sessions into memory cache
  try {
    const existingSessions = await db.all(`
      SELECT s.token, u.id, u.email, u.name, u.provider 
      FROM sessions s 
      JOIN users u ON s.user_id = u.id
    `);
    for (const row of existingSessions) {
      activeSessions.set(row.token, {
        id: row.id,
        email: row.email,
        name: row.name,
        provider: row.provider
      });
    }
  } catch (err) {
    console.warn('[DB Init] Error preloading sessions:', err.message);
  }

  console.log('[Database] SQLite initialized with tables, foreign keys, and indexes.');
};

const app = express();
app.use(cors());
app.use(express.json());

// Model Context Protocol (MCP) Endpoints
// 1. Pure JSON-RPC 2.0 endpoint (HTTP transport)
app.post('/api/mcp', handleMcpJsonRpc);

// 2. Convenience REST discovery endpoints
app.get('/api/mcp/tools', (req, res) => {
  res.json({
    tools: REGAARDER_MCP_TOOLS.map(t => ({
      name: t.name,
      description: t.description,
      inputSchema: toStandardJsonSchema(t.parameters)
    }))
  });
});

app.get('/api/mcp/resources', (req, res) => {
  res.json({ resources: REGAARDER_MCP_RESOURCES });
});

app.get('/api/mcp/prompts', (req, res) => {
  res.json({ prompts: REGAARDER_MCP_PROMPTS });
});

// 3. Standard MCP Server-Sent Events (SSE) Transport (for Claude Desktop, Cursor, and Windsurf)
const mcpSseClients = new Map();

app.get('/mcp/sse', (req, res) => {
  const sessionId = `mcp_sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  if (typeof res.flushHeaders === 'function') {
    res.flushHeaders();
  }

  mcpSseClients.set(sessionId, res);

  // Send the endpoint event as per MCP SSE transport specification
  res.write(`event: endpoint\ndata: /mcp/message?sessionId=${sessionId}\n\n`);

  req.on('close', () => {
    mcpSseClients.delete(sessionId);
  });
});

app.post('/mcp/message', (req, res) => {
  const { sessionId } = req.query;
  const message = req.body || {};
  const response = processMcpRequest(message);

  const clientRes = sessionId ? mcpSseClients.get(sessionId) : null;
  if (clientRes && response) {
    clientRes.write(`event: message\ndata: ${JSON.stringify(response)}\n\n`);
    return res.status(202).json({ status: 'accepted' });
  }

  if (!response) {
    return res.status(204).end();
  }
  return res.json(response);
});

// ─────────────────────────────────────────────────────────────────────────────
// API Auth Routes (SQLite Backed with Scrypt Hashing & Session Storage)
// ─────────────────────────────────────────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return res.status(400).json({ message: 'Please enter a valid email address.' });
  }

  if (String(password).length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  try {
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const hashedPassword = await hashPassword(password);
    const userId = 'user_' + Date.now();
    const now = new Date().toISOString();

    await db.run(
      'INSERT INTO users (id, email, name, password_hash, provider, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, normalizedEmail, String(name).trim().slice(0, 100), hashedPassword, 'email', now]
    );

    const token = 'session_' + crypto.randomBytes(32).toString('hex');
    const userResponse = { id: userId, email: normalizedEmail, name: String(name).trim(), provider: 'email' };

    await db.run(
      'INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)',
      [token, userId, Date.now() + 30 * 24 * 60 * 60 * 1000, now]
    );
    activeSessions.set(token, userResponse);

    res.status(201).json({ token, user: userResponse });
  } catch (err) {
    console.error('[Auth Register Error]', err);
    res.status(500).json({ message: 'Internal server error during registration.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const { valid, shouldUpgrade } = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Transparently upgrade legacy SHA-256 hashes to salted scrypt
    if (shouldUpgrade) {
      const upgradedHash = await hashPassword(password);
      await db.run('UPDATE users SET password_hash = ? WHERE id = ?', [upgradedHash, user.id]);
      console.log(`[Security] Upgraded user password hash to scrypt for: ${user.email}`);
    }

    const token = 'session_' + crypto.randomBytes(32).toString('hex');
    const userResponse = { id: user.id, email: user.email, name: user.name, provider: user.provider };
    const now = new Date().toISOString();

    await db.run(
      'INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)',
      [token, user.id, Date.now() + 30 * 24 * 60 * 60 * 1000, now]
    );
    activeSessions.set(token, userResponse);

    res.json({ token, user: userResponse });
  } catch (err) {
    console.error('[Auth Login Error]', err);
    res.status(500).json({ message: 'Internal server error during login.' });
  }
});

app.post('/api/auth/social', async (req, res) => {
  const { provider, email, name } = req.body || {};
  if (!provider || !email || !name) {
    return res.status(400).json({ message: 'Missing social profile fields.' });
  }

  const normalizedProvider = String(provider).toLowerCase().trim();
  if (!['google', 'apple'].includes(normalizedProvider)) {
    return res.status(400).json({ message: 'Unsupported authentication provider.' });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return res.status(400).json({ message: 'Invalid email address format.' });
  }

  try {
    let user = await db.get('SELECT * FROM users WHERE email = ?', [normalizedEmail]);

    if (user) {
      // Security check: Prevent account hijacking if account was registered via email/password
      if (user.provider === 'email') {
        return res.status(409).json({
          message: 'This email is registered with password sign-in. Please sign in with your email and password.'
        });
      }

      // Security check: Prevent cross-provider takeover
      if (user.provider !== normalizedProvider) {
        const providerLabel = user.provider ? user.provider.charAt(0).toUpperCase() + user.provider.slice(1) : 'another provider';
        return res.status(409).json({
          message: `This email is already associated with ${providerLabel}. Please sign in with ${providerLabel}.`
        });
      }
    } else {
      // Create new user strictly for this social signup
      const userId = 'user_' + Date.now();
      const now = new Date().toISOString();
      await db.run(
        'INSERT INTO users (id, email, name, password_hash, provider, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, normalizedEmail, String(name).trim().slice(0, 100) || 'User', null, normalizedProvider, now]
      );
      user = { id: userId, email: normalizedEmail, name: String(name).trim() || 'User', provider: normalizedProvider };
    }

    const token = 'session_' + crypto.randomBytes(32).toString('hex');
    const userResponse = { id: user.id, email: user.email, name: user.name, provider: user.provider };
    const now = new Date().toISOString();

    await db.run(
      'INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)',
      [token, user.id, Date.now() + 30 * 24 * 60 * 60 * 1000, now]
    );
    activeSessions.set(token, userResponse);

    res.json({ token, user: userResponse });
  } catch (err) {
    console.error('[Auth Social Error]', err);
    res.status(500).json({ message: 'Internal server error during social sign-in.' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No authorization token provided.' });
  }

  const token = authHeader.split(' ')[1];
  let user = activeSessions.get(token);

  if (!user && db) {
    // Check persistent SQLite sessions table if not in memory cache
    try {
      const sessionRow = await db.get(`
        SELECT u.id, u.email, u.name, u.provider 
        FROM sessions s 
        JOIN users u ON s.user_id = u.id 
        WHERE s.token = ?
      `, [token]);
      if (sessionRow) {
        user = { id: sessionRow.id, email: sessionRow.email, name: sessionRow.name, provider: sessionRow.provider };
        activeSessions.set(token, user);
      }
    } catch (e) {}
  }

  if (!user) {
    return res.status(401).json({ message: 'Session expired or invalid.' });
  }

  res.json({ user });
});

app.post('/api/auth/logout', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeSessions.delete(token);
    if (db) {
      await db.run('DELETE FROM sessions WHERE token = ?', [token]).catch(() => {});
    }
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// Authentication middleware for Meetings/Invites/Documents
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  let user = activeSessions.get(token);

  if (!user && db) {
    try {
      const sessionRow = await db.get(`
        SELECT u.id, u.email, u.name, u.provider 
        FROM sessions s 
        JOIN users u ON s.user_id = u.id 
        WHERE s.token = ?
      `, [token]);
      if (sessionRow) {
        user = { id: sessionRow.id, email: sessionRow.email, name: sessionRow.name, provider: sessionRow.provider };
        activeSessions.set(token, user);
      }
    } catch (e) {}
  }

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
    
    if (guests && guests.length > 0) {
      for (const guest of guests) {
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
    
    await db.run(
      'INSERT INTO events (user_id, date, title, link, time) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, invite.date, invite.title, '', invite.time]
    );
    
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

// ─────────────────────────────────────────────────────────────────────────────
// Socket.IO with Authentication Guard for AI Orchestration
// ─────────────────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: '*' }
});

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (token && activeSessions.has(token)) {
    socket.user = activeSessions.get(token);
  } else {
    socket.user = null;
  }
  next();
});

io.on('connection', (socket) => {
  console.log('Socket.IO Client connected:', socket.id, socket.user ? `(User: ${socket.user.email})` : '(Unauthenticated)');

  socket.on('start_agent_task', async (data) => {
    // Require authenticated session to trigger AI agent execution
    if (!socket.user) {
      socket.emit('agent_error', { message: 'Authentication required. Please sign in to run AI agent tasks.' });
      return;
    }

    const { intent, context } = data || {};
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_DEMO_API_KEY;
    
    if (!apiKey) {
      socket.emit('agent_error', { message: 'API Key missing on server environment.' });
      return;
    }

    try {
      await processAgentRequest(socket, intent, context, apiKey);
    } catch (err) {
      console.error('[Agent Task Error]', err);
      socket.emit('agent_error', { message: err.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket.IO Client disconnected:', socket.id);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Yjs WebSocket Server with Access Verification
// ─────────────────────────────────────────────────────────────────────────────
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws, req) => {
  console.log('Yjs WebSocket Client connected');
  setupWSConnection(ws, req);
});

server.on('upgrade', (request, socket, head) => {
  const parsedUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Route Yjs connections to the WebSocket Server with security check
  if (pathname.startsWith('/yjs')) {
    const token = parsedUrl.searchParams.get('token');
    const user = token ? activeSessions.get(token) : null;

    // In production, require authenticated session
    if (!user && process.env.NODE_ENV === 'production') {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

const PORT = process.env.PORT || 3001;
// Initialize database and start listening
initDatabase().then(() => {
  server.listen(PORT, () => {
    console.log(`Agent OS Backend running on port ${PORT}`);
    console.log(`Yjs Collaboration Server running on ws://localhost:${PORT}/yjs`);
  });
}).catch(err => {
  console.error('[Fatal] Database initialization failed:', err);
  process.exit(1);
});
