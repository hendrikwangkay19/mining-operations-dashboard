import 'dotenv/config';
import app from './server/app.js';
import { initDb } from './server/config/db.js';
import { runSeed } from './server/db/seed.js';

const PORT = process.env.PORT || 4173;

async function main() {
  await initDb();
  await runSeed();
  app.listen(PORT, () => {
    console.log(`MineDesk running at http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
