import 'dotenv/config';
import app from './server/app.js';

const PORT = process.env.PORT || 4173;

app.listen(PORT, () => {
  console.log(`MineDesk running at http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
