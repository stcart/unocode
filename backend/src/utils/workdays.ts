import { formatDateOnly, parseDateOnly } from "./dates";

export type PracticeWeek = {
  weekStart: string;
  days: string[];
};

export function isWorkday(date: Date): boolean {
  const day = date.getUTCDay();
  return day !== 0 && day !== 6;
}

export function generateWorkdays(start: Date, end: Date): string[] {
  const workdays: string[] = [];
  const current = new Date(start);

  while (current <= end) {
    if (isWorkday(current)) {
      workdays.push(formatDateOnly(current));
    }

    current.setUTCDate(current.getUTCDate() + 1);
  }

  return workdays;
}

export function getMondayOfWeek(dateStr: string): string {
  const date = parseDateOnly(dateStr, "date");
  const day = date.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + diff);
  return formatDateOnly(date);
}

export function groupWorkdaysIntoWeeks(workdays: string[]): PracticeWeek[] {
  const weeks = new Map<string, string[]>();

  for (const day of workdays) {
    const weekStart = getMondayOfWeek(day);
    const days = weeks.get(weekStart) ?? [];
    days.push(day);
    weeks.set(weekStart, days);
  }

  return Array.from(weeks.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([weekStart, days]) => ({
      weekStart,
      days: days.sort(),
    }));
}

export function getDefaultWeekStart(
  weeks: PracticeWeek[],
  today = formatDateOnly(new Date())
): string | null {
  if (weeks.length === 0) {
    return null;
  }

  const currentWeek = weeks.find((week) =>
    week.days.some((day) => day >= today)
  );

  if (currentWeek) {
    return currentWeek.weekStart;
  }

  if (today < weeks[0].days[0]) {
    return weeks[0].weekStart;
  }

  return weeks[weeks.length - 1].weekStart;
}

export function resolveWeek(
  weeks: PracticeWeek[],
  requestedWeekStart?: string
): { week: PracticeWeek | null; weekIndex: number } {
  if (weeks.length === 0) {
    return { week: null, weekIndex: -1 };
  }

  if (requestedWeekStart) {
    const weekIndex = weeks.findIndex(
      (week) => week.weekStart === requestedWeekStart
    );

    if (weekIndex >= 0) {
      return { week: weeks[weekIndex], weekIndex };
    }
  }

  const defaultWeekStart = getDefaultWeekStart(weeks);
  const weekIndex = weeks.findIndex(
    (week) => week.weekStart === defaultWeekStart
  );

  return {
    week: weeks[weekIndex] ?? weeks[0],
    weekIndex: weekIndex >= 0 ? weekIndex : 0,
  };
}

export function formatDayLabel(dateStr: string): string {
  const date = parseDateOnly(dateStr, "date");
  const labels = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${labels[date.getUTCDay()]} ${day}.${month}`;
}
