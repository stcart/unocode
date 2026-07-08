export const DOCUMENT_STATIC_FIELDS = {
  institute: "ИРИТ-РТФ",
  department: "школа бакалавриата (школа)",
  practice_place: "ИП Езуб Антон Сергеевич, удалённое прохождение",
  practice_type: "Производственная практика",
  practice_kind: "Производственная практика, технологическая",
  report_contents:
    "введение, описание работы, результат практики, заключение, список использованных источников",
  schedule_org_stage:
    "организационный этап: ознакомление с деятельностью организации, постановка задач",
  schedule_final_stage:
    "заключительный этап: оформление отчёта, подготовка материалов к защите",
  supervisor_company: "Езуб Антон Сергеевич",
  supervisor_university: "Корнякова Елена Михайловна",
} as const;

export const DOCUMENT_TYPES = [
  "individual-task",
  "review",
  "title-page",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  "individual-task": "Индивидуальное задание",
  review: "Отзыв о практике",
  "title-page": "Титульный лист отчёта",
};

export const TEMPLATE_FILES: Record<DocumentType, string> = {
  "individual-task": "individual-task.docx",
  review: "review.docx",
  "title-page": "title-page.docx",
};

export function extractCohortYear(cohortName: string): string {
  const match = cohortName.match(/\d{4}/);
  return match?.[0] ?? cohortName;
}

export function formatCityYear(cohortName: string): string {
  return `Екатеринбург, ${extractCohortYear(cohortName)}`;
}

export function formatDateRu(date: Date): string {
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}.${month}.${year}`;
}
