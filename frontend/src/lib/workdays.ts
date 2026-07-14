export type PracticeWeek = {
  weekStart: string;
  days: string[];
};

export function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function isWorkday(date: Date): boolean {
  const day = date.getUTCDay();
  return day !== 0 && day !== 6;
}

export function generateWorkdays(start: string, end: string): string[] {
  const workdays: string[] = [];
  const current = parseDateOnly(start);
  const endDate = parseDateOnly(end);

  while (current <= endDate) {
    if (isWorkday(current)) {
      workdays.push(formatDateOnly(current));
    }

    current.setUTCDate(current.getUTCDate() + 1);
  }

  return workdays;
}

export function formatDateRu(dateStr: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (match) {
    return `${match[3]}.${match[2]}.${match[1]}`;
  }

  const date = parseDateOnly(dateStr);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}.${month}.${year}`;
}

export function formatDayLabel(dateStr: string): string {
  const date = parseDateOnly(dateStr);
  const labels = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  return `${labels[date.getUTCDay()]} ${formatDateRu(dateStr)}`;
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("ru-RU");
}
