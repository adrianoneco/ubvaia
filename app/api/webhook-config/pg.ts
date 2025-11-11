import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT || 5432),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

export async function ensureTable() {
  await pool.query(`CREATE TABLE IF NOT EXISTS webhook_config (
    id SERIAL PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
}

export async function saveConfig(data: any) {
  await ensureTable();
  await pool.query(
    'INSERT INTO webhook_config (data) VALUES ($1)',
    [JSON.stringify(data)]
  );
}

export async function getLastConfig() {
  await ensureTable();
  const res = await pool.query('SELECT data FROM webhook_config ORDER BY updated_at DESC LIMIT 1');
  return res.rows[0]?.data || null;
}
