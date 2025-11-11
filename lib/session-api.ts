import { dbExport, pool } from './session-db';
// Retorna todas as sessões já com as últimas N mensagens (default: 20)
export async function getAllSessionsWithMessages(limit: number = 20): Promise<any[]> {
  const sessionsRes = await pool.query(`SELECT * FROM sessions ORDER BY created_at DESC`);
  const sessions = sessionsRes.rows;
  const result = await Promise.all(sessions.map(async (session: any) => {
    const messagesRes = await pool.query(
      `SELECT * FROM messages WHERE session_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [session.id, limit]
    );
    const messages = messagesRes.rows
      .map((m: any) => ({
        ...m,
        imageUrl: m.image_url || undefined,
      }))
      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    return { ...session, messages };
  }));
  return result;
}
// Session API: supports only PostgreSQL
import { v4 as uuidv4 } from 'uuid';

export type MessageRecord = {
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  contentType: string;
  imageUrl?: string;
};

export type SessionRecord = {
  id: string;
  name: string;
};

export async function saveMessage({ sessionId, role, content, contentType, imageUrl }: MessageRecord): Promise<void> {
  const id = uuidv4();
  // Ensure session exists to satisfy foreign key constraint
  try {
    await dbExport.pool.query(`INSERT INTO sessions (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`, [sessionId, `Sessão ${sessionId}`]);
    await dbExport.pool.query(
      `INSERT INTO messages (id, session_id, role, content, content_type, image_url) VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, sessionId, role, content, contentType, imageUrl || null]
    );
  } catch (err) {
    // Re-throw so route handlers can log properly
    console.error('Error saving message to Postgres:', err);
    throw err;
  }
}

export async function saveSession({ id, name }: SessionRecord): Promise<void> {
  await dbExport.pool.query(`INSERT INTO sessions (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`, [id, name]);
}

export async function getMessagesBySession(sessionId: string): Promise<any[]> {
  const res = await dbExport.pool.query(`SELECT * FROM messages WHERE session_id = $1 ORDER BY created_at ASC`, [sessionId]);
  return res.rows.map((m: any) => ({
    ...m,
    imageUrl: m.image_url || undefined,
  }));
}

export async function getAllSessions(): Promise<any[]> {
  const res = await dbExport.pool.query(`SELECT * FROM sessions ORDER BY created_at DESC`);
  return res.rows;
}

// Config persistence (store settings like webhookUrl, authToken, chatName)
export async function saveConfig(key: string, value: any): Promise<void> {
  await dbExport.pool.query(
    `INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP`,
    [key, value]
  );
}

export async function getConfig(key: string): Promise<any | null> {
  const res = await dbExport.pool.query(`SELECT value FROM settings WHERE key = $1 LIMIT 1`, [key]);
  if (res.rowCount === 0) return null;
  return res.rows[0].value;
}
