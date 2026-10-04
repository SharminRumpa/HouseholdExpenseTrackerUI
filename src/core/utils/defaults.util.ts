
export function today(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// Local-date helpers (yyyy-MM-dd). Built from local parts, not toISOString(),
// so the value never shifts a day because of the UTC offset.
export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayString(): string {
  return toDateString(new Date());
}

export function firstOfMonthString(): string {
  const now = new Date();
  return toDateString(new Date(now.getFullYear(), now.getMonth(), 1));
}