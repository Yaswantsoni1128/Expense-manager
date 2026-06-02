export type User = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type Expense = {
  id: number;
  title: string;
  amount: number;
  category: string;
  date: string;
  note: string | null;
  createdAt: string;
};

export type ExpenseInput = {
  title: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
};

export type Summary = {
  month?: string;
  total: number;
  count: number;
  byCategory: { category: string; total: number }[];
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

export type PaginatedExpenses = {
  data: Expense[];
  pagination: PaginationMeta;
};

export type MonthSummary = {
  month: string;
  label: string;
  total: number;
  count: number;
  isHighSpending: boolean;
  percentAboveAverage: number;
};

export type MonthlyOverview = {
  months: MonthSummary[];
  averageMonthlySpend: number;
  highestMonth: MonthSummary | null;
  lowestMonth: MonthSummary | null;
  insights: string[];
};
