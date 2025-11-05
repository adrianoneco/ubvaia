// API para salvar mensagens no banco SQLite
import db from './session-db';
import { v4 as uuidv4 } from 'uuid';

export type MessageRecord = {
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  contentType: string;
};

export type SessionRecord = {
  id: string;
  name: string;
};

export function saveMessage({ sessionId, role, content, contentType }: MessageRecord): void {
  const id = uuidv4();
  db.prepare(`INSERT INTO messages (id, session_id, role, content, content_type) VALUES (?, ?, ?, ?, ?)`)
    .run(id, sessionId, role, content, contentType);
}

export function saveSession({ id, name }: SessionRecord): void {
  db.prepare(`INSERT OR IGNORE INTO sessions (id, name) VALUES (?, ?)`)
    .run(id, name);
}

export function getMessagesBySession(sessionId: string): any[] {
  return db.prepare(`SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC`).all(sessionId);
}

export function getAllSessions(): any[] {
  return db.prepare(`SELECT * FROM sessions ORDER BY created_at DESC`).all();
}
