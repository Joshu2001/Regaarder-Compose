import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { processAgentRequest } from './orchestrator.js';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

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
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Agent OS Backend running on port ${PORT}`);
});
