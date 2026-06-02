import { Router } from 'express';
import { z } from 'zod';
import { pool, type ExpenseRow } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import type {
  Expense,
  ExpenseInput,
  MonthlyOverview,
  MonthSummary,
  PaginatedExpenses,
  Summary,
} from '../types.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { currentMonth, monthLabel, parseMonthQuery } from '../utils/month.js';
import { buildPaginationMeta, parsePagination } from '../utils/pagination.js';

const router = Router();

router.use(requireAuth);

const CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Other',
] as const;

const expenseInputSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120),
  amount: z.number().positive('Amount in rupees must be greater than 0'),
  category: z.enum(CATEGORIES).default('Other'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  note: z.string().trim().max(500).optional(),
});

function formatDate(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return String(value).slice(0, 10);
}

function formatTimestamp(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return String(value);
}

function rowToExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    title: row.title,
    amount: Number(row.amount),
    category: row.category,
    date: formatDate(row.date),
    note: row.note,
    createdAt: formatTimestamp(row.created_at),
  };
}

function monthFilterClause(month: string | undefined, startParam: number): {
  sql: string;
  params: (number | string)[];
} {
  if (!month) {
    return { sql: '', params: [] };
  }
  return {
    sql: ` AND to_char(date, 'YYYY-MM') = $${startParam}`,
    params: [month],
  };
}

async function getSummaryForUser(
  userId: number,
  month?: string,
): Promise<Summary> {
  const monthClause = monthFilterClause(month, 2);
  const params: (number | string)[] = [userId, ...monthClause.params];

  const totalResult = await pool.query<{ total: string; count: string }>(
    `SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*)::text AS count
     FROM expenses WHERE user_id = $1${monthClause.sql}`,
    params,
  );
  const totalRow = totalResult.rows[0];

  const byCategoryResult = await pool.query<{ category: string; total: string }>(
    `SELECT category, COALESCE(SUM(amount), 0) AS total
     FROM expenses
     WHERE user_id = $1${monthClause.sql}
     GROUP BY category
     ORDER BY total DESC`,
    params,
  );

  return {
    month,
    total: Number(totalRow.total),
    count: Number(totalRow.count),
    byCategory: byCategoryResult.rows.map((row) => ({
      category: row.category,
      total: Number(row.total),
    })),
  };
}

function buildMonthlyOverview(rows: { month: string; total: string; count: string }[]): MonthlyOverview {
  if (rows.length === 0) {
    return {
      months: [],
      averageMonthlySpend: 0,
      highestMonth: null,
      lowestMonth: null,
      insights: ['No expenses recorded yet. Add expenses to see monthly insights.'],
    };
  }

  const totals = rows.map((r) => Number(r.total));
  const average = totals.reduce((a, b) => a + b, 0) / totals.length;
  const threshold = average * 1.2;

  const months: MonthSummary[] = rows.map((row) => {
    const total = Number(row.total);
    const percentAbove =
      average > 0 ? Math.round(((total - average) / average) * 100) : 0;
    return {
      month: row.month,
      label: monthLabel(row.month),
      total,
      count: Number(row.count),
      isHighSpending: total >= threshold && total > 0,
      percentAboveAverage: percentAbove,
    };
  });

  const sorted = [...months].sort((a, b) => b.total - a.total);
  const highestMonth = sorted[0] ?? null;
  const lowestMonth = sorted[sorted.length - 1] ?? null;

  const insights: string[] = [];
  const highMonths = months.filter((m) => m.isHighSpending);
  if (highMonths.length > 0) {
    insights.push(
      `High spending in ${highMonths.map((m) => m.label).join(', ')} (20%+ above your average of ₹${average.toFixed(0)}).`,
    );
  }
  if (highestMonth) {
    insights.push(
      `${highestMonth.label} was your costliest month at ₹${highestMonth.total.toLocaleString('en-IN')}.`,
    );
  }
  if (lowestMonth && lowestMonth.month !== highestMonth?.month) {
    insights.push(
      `${lowestMonth.label} had the lowest spend at ₹${lowestMonth.total.toLocaleString('en-IN')}.`,
    );
  }
  if (insights.length === 0) {
    insights.push('Your monthly spending is fairly consistent across recorded months.');
  }

  return {
    months,
    averageMonthlySpend: Math.round(average * 100) / 100,
    highestMonth,
    lowestMonth,
    insights,
  };
}

router.get('/categories', (_req, res) => {
  res.json({ categories: CATEGORIES });
});

router.get(
  '/monthly-overview',
  asyncHandler(async (req, res) => {
    const result = await pool.query<{ month: string; total: string; count: string }>(
      `SELECT to_char(date, 'YYYY-MM') AS month,
              COALESCE(SUM(amount), 0) AS total,
              COUNT(*)::text AS count
       FROM expenses
       WHERE user_id = $1
       GROUP BY to_char(date, 'YYYY-MM')
       ORDER BY month DESC`,
      [req.userId],
    );

    res.json(buildMonthlyOverview(result.rows));
  }),
);

router.get(
  '/summary',
  asyncHandler(async (req, res) => {
    const month = parseMonthQuery(req.query.month);
    if (req.query.month && !month) {
      res.status(400).json({ error: 'Invalid month. Use YYYY-MM format.' });
      return;
    }
    const summary = await getSummaryForUser(req.userId!, month ?? currentMonth());
    res.json(summary);
  }),
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const month = parseMonthQuery(req.query.month);
    if (req.query.month && !month) {
      res.status(400).json({ error: 'Invalid month. Use YYYY-MM format.' });
      return;
    }

    const { page, limit, offset } = parsePagination(req.query);
    const monthClause = monthFilterClause(month, 2);
    const baseParams: (number | string)[] = [req.userId!, ...monthClause.params];

    const countResult = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM expenses WHERE user_id = $1${monthClause.sql}`,
      baseParams,
    );
    const total = Number(countResult.rows[0].count);

    const limitParam = baseParams.length + 1;
    const offsetParam = baseParams.length + 2;
    const listParams = [...baseParams, limit, offset];

    const result = await pool.query<ExpenseRow>(
      `SELECT * FROM expenses
       WHERE user_id = $1${monthClause.sql}
       ORDER BY date DESC, id DESC
       LIMIT $${limitParam} OFFSET $${offsetParam}`,
      listParams,
    );

    const response: PaginatedExpenses = {
      data: result.rows.map(rowToExpense),
      pagination: buildPaginationMeta(page, limit, total),
    };
    res.json(response);
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: 'Invalid expense id' });
      return;
    }

    const result = await pool.query<ExpenseRow>(
      'SELECT * FROM expenses WHERE id = $1 AND user_id = $2',
      [id, req.userId],
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }

    res.json(rowToExpense(result.rows[0]));
  }),
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = expenseInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const input: ExpenseInput = parsed.data;
    const result = await pool.query<ExpenseRow>(
      `INSERT INTO expenses (user_id, title, amount, category, date, note)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        req.userId,
        input.title,
        input.amount,
        input.category,
        input.date,
        input.note ?? null,
      ],
    );

    res.status(201).json(rowToExpense(result.rows[0]));
  }),
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: 'Invalid expense id' });
      return;
    }

    const parsed = expenseInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const input: ExpenseInput = parsed.data;
    const result = await pool.query<ExpenseRow>(
      `UPDATE expenses
       SET title = $1, amount = $2, category = $3, date = $4, note = $5
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [
        input.title,
        input.amount,
        input.category,
        input.date,
        input.note ?? null,
        id,
        req.userId,
      ],
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }

    res.json(rowToExpense(result.rows[0]));
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: 'Invalid expense id' });
      return;
    }

    const result = await pool.query(
      'DELETE FROM expenses WHERE id = $1 AND user_id = $2',
      [id, req.userId],
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }

    res.status(204).send();
  }),
);

export default router;
