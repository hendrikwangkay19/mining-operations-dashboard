import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

// SSL only when DATABASE_URL explicitly contains sslmode=require (e.g. Neon, RDS)
// Railway internal networking (*.railway.internal) does not use SSL
const sslConfig = process.env.DATABASE_URL?.includes('sslmode=require')
  ? { rejectUnauthorized: false }
  : false;

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslConfig,
});

export async function initDb() {
  const schema = readFileSync(join(__dirname, '../db/schema.sql'), 'utf8');
  await db.query(schema);
}

export default db;
