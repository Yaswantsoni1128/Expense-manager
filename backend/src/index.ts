import cors from 'cors';
import express from 'express';
import { config } from './config.js';
import { closeDb, initDb } from './db.js';
import authRouter from './routes/auth.js';
import expensesRouter from './routes/expenses.js';

const app = express();

app.use(
  config.corsOrigins
    ? cors({ origin: config.corsOrigins })
    : cors(),
);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/expenses', expensesRouter);

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  },
);

async function main() {
  await initDb();

  const server = app.listen(config.port, config.host, () => {
    console.log(`Expense tracker API running on http://${config.host}:${config.port}`);
    console.log('Connected to PostgreSQL');
  });

  const shutdown = async () => {
    server.close();
    await closeDb();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
