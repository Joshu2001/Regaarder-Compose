import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { setupWSConnection } from 'y-websocket/bin/utils';
import { processAgentRequest } from './orchestrator.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

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
