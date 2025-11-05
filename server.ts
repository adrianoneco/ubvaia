import type { Request, Response } from 'express';
// Simple Express HTTP API for chat bot integration
// Run: npm install express cors

const express = require('express');
const cors = require('cors');
import { saveMessage, saveSession, getMessagesBySession } from './session-api';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(cors());
app.use(express.json());

// Create a new chat session
app.post('/api/session', (req: Request, res: Response) => {
  const id = uuidv4();
  const name = req.body.name || `Sessão ${id}`;
  saveSession({ id, name });
  res.json({ id, name });
});

// Save a message (question or answer)
app.post('/api/message', (req: Request, res: Response) => {
  const { sessionId, role, content, contentType } = req.body;
  saveMessage({ sessionId, role, content, contentType });
  res.json({ success: true });
});

// Get all messages for a session
app.get('/api/session/:id/messages', (req: Request, res: Response) => {
  const sessionId = req.params.id;
  const messages = getMessagesBySession(sessionId);
  res.json(messages);
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Chat bot API running on port ${PORT}`);
});
