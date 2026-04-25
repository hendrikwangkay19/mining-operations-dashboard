import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath    = join(__dirname, '../../minedesk.db');
const schemaSQL = readFileSync(join(__dirname, '../db/schema.sql'), 'utf8');

const db = new DatabaseSync(dbPath);
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');
db.exec(schemaSQL);

export default db;
