import { getApiBaseUrl } from '../config';
import { getToken } from '../storage/authStorage';
import type {
  AuthResponse,
  Expense,
  ExpenseInput,
  MonthlyOverview,
  PaginatedExpenses,
  Summary,
  User,
} from '../types';

const baseUrl = getApiBaseUrl();

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (typeof body.error === 'string') {
        message = body.error;
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export const api = {
  signup: (name: string, email: string, password: string) =>
    request<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => request<{ user: User }>('/api/auth/me'),

  getExpenses: (month?: string, page = 1, limit = 15) =>
    request<PaginatedExpenses>(
      `/api/expenses${buildQuery({ month, page, limit })}`,
    ),

  getExpense: (id: number) => request<Expense>(`/api/expenses/${id}`),

  getSummary: (month?: string) =>
    request<Summary>(`/api/expenses/summary${buildQuery({ month })}`),

  getMonthlyOverview: () =>
    request<MonthlyOverview>('/api/expenses/monthly-overview'),

  getCategories: () => request<{ categories: string[] }>('/api/expenses/categories'),

  createExpense: (input: ExpenseInput) =>
    request<Expense>('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  updateExpense: (id: number, input: ExpenseInput) =>
    request<Expense>(`/api/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),

  deleteExpense: (id: number) =>
    request<void>(`/api/expenses/${id}`, { method: 'DELETE' }),

  healthCheck: () => request<{ status: string }>('/health'),
};
