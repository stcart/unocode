export function inferFioFromAnswers(
  answers: Array<{ value: string; surveyField: { label: string } }>
): string | null {
  for (const answer of answers) {
    const label = answer.surveyField.label.trim().toLowerCase();
    if (label.includes("фио") || label === "ф.и.о.") {
      return answer.value.trim() || null;
    }
  }

  return null;
}

export function inferGroupFromAnswers(
  answers: Array<{ value: string; surveyField: { label: string } }>
): string | null {
  for (const answer of answers) {
    const label = answer.surveyField.label.trim().toLowerCase();
    if (label.includes("групп")) {
      return answer.value.trim() || null;
    }
  }

  return null;
}
