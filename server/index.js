import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { setupWSConnection } from 'y-websocket/bin/utils';
import { processAgentRequest } from './orchestrator.js';

const app = express();
app.use(cors());
app.use(express.json());

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
