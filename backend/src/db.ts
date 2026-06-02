import pg from 'pg';
import { config } from './config.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.databaseUrl,
});

export type UserRow = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date | string;
};

export type ExpenseRow = {
  id: number;
  user_id: number;
  title: string;
  amount: string | number;
  category: string;
  date: Date | string;
  note: string | null;
  created_at: Date | string;
};

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(120) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    category VARCHAR(50) NOT NULL DEFAULT 'Other',
    date DATE NOT NULL,
    note VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  ALTER TABLE expenses ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

  CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
  CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses (user_id);
  CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses (date DESC);
  CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses (category);
  CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses (user_id, date DESC);
`;

export async function initDb(): Promise<void> {
  await pool.query(SCHEMA_SQL);
}

export async function closeDb(): Promise<void> {
  await pool.end();
}
