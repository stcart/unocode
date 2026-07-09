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

export function formatDayLabel(dateStr: string): string {
  const date = parseDateOnly(dateStr);
  const labels = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${labels[date.getUTCDay()]} ${day}.${month}`;
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("ru-RU");
}
