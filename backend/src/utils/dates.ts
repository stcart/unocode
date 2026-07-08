export function parseDateOnly(value: string, fieldName: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Поле ${fieldName} должно быть датой в формате YYYY-MM-DD`);
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Некорректная дата в поле ${fieldName}`);
  }

  return date;
}

export function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function validateDateRanges(input: {
  applicationStart: Date;
  applicationEnd: Date;
  practiceStart: Date;
  practiceEnd: Date;
}): void {
  if (input.applicationEnd < input.applicationStart) {
    throw new Error(
      "Дата окончания приёма заявок не может быть раньше даты начала"
    );
  }

  if (input.practiceEnd < input.practiceStart) {
    throw new Error(
      "Дата окончания практики не может быть раньше даты начала"
    );
  }
}
