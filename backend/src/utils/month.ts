const MONTH_REGEX = /^\d{4}-\d{2}$/;

export function isValidMonth(value: string): boolean {
  if (!MONTH_REGEX.test(value)) return false;
  const [year, month] = value.split('-').map(Number);
  return year >= 2000 && year <= 2100 && month >= 1 && month <= 12;
}

export function monthLabel(month: string): string {
  const [year, m] = month.split('-').map(Number);
  const date = new Date(year, m - 1, 1);
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export function currentMonth(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function parseMonthQuery(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value) return undefined;
  return isValidMonth(value) ? value : undefined;
}
