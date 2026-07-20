"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Application } from "@/lib/types/application";
import type { DocumentContext, StudentDocumentInput } from "@/lib/types/document";
import {
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_TYPES,
  type DocumentType,
} from "@/lib/types/document";
import {
  fetchDocumentContext,
  generateDocument,
  saveDocumentFields,
  triggerFileDownload,
  uploadReport,
} from "@/lib/api/documents";
import { ApiError } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { applicationStatusVariants } from "@/lib/application-status";

type DocumentsTabProps = {
  applications: Application[];
};

type FormState = {
  studentFio: string;
  group: string;
  directionCode: string;
  directionName: string;
  programName: string;
  specialty: string;
  practiceTopic: string;
  mainStageTasks: string;
  supervisorUrfuName: string;
};

const EMPTY_FORM: FormState = {
  studentFio: "",
  group: "",
  directionCode: "",
  directionName: "",
  programName: "",
  specialty: "",
  practiceTopic: "",
  mainStageTasks: "",
  supervisorUrfuName: "",
};

function dataToForm(data: DocumentContext["data"]): FormState {
  return {
    studentFio: data.studentFio ?? "",
    group: data.group ?? "",
    directionCode: data.directionCode ?? "",
    directionName: data.directionName ?? "",
    programName: data.programName ?? "",
    specialty: data.specialty ?? "",
    practiceTopic: data.practiceTopic ?? "",
    mainStageTasks: data.mainStageTasks ?? "",
    supervisorUrfuName: data.supervisorUrfuName ?? "",
  };
}

function formToInput(form: FormState): StudentDocumentInput {
  return {
    studentFio: form.studentFio,
    group: form.group,
    directionCode: form.directionCode,
    directionName: form.directionName,
    programName: form.programName,
    specialty: form.specialty,
    practiceTopic: form.practiceTopic,
    mainStageTasks: form.mainStageTasks,
    supervisorUrfuName: form.supervisorUrfuName,
  };
}

const FIELD_CONFIG: Array<{
  key: keyof FormState;
  label: string;
  multiline?: boolean;
}> = [
  { key: "studentFio", label: "ФИО студента" },
  { key: "group", label: "Группа" },
  { key: "directionCode", label: "Код направления" },
  { key: "directionName", label: "Наименование направления" },
  { key: "programName", label: "Образовательная программа" },
  { key: "specialty", label: "Специальность (для титульного листа)" },
  { key: "practiceTopic", label: "Тема практики" },
  {
    key: "mainStageTasks",
    label: "Перечень работ основного этапа",
    multiline: true,
  },
  {
    key: "supervisorUrfuName",
    label: "Руководитель практики от УрФУ",
  },
];

export function DocumentsTab({ applications }: DocumentsTabProps) {
  const [selectedCohortId, setSelectedCohortId] = useState<number | null>(null);
  const [context, setContext] = useState<DocumentContext | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatingType, setGeneratingType] = useState<DocumentType | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false);
  const lastSavedForm = useRef<FormState>(EMPTY_FORM);

  useEffect(() => {
    if (applications.length > 0 && selectedCohortId === null) {
      setSelectedCohortId(applications[0].cohortId);
    }
  }, [applications, selectedCohortId]);

  const loadContext = useCallback(async (cohortId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchDocumentContext(cohortId);
      const nextForm = dataToForm(data.data);
      setContext(data);
      setForm(nextForm);
      lastSavedForm.current = nextForm;
    } catch (err) {
      setContext(null);
      setError(
        err instanceof ApiError
          ? err.message
          : "Не удалось загрузить данные документов"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCohortId !== null) {
      void loadContext(selectedCohortId);
    }
  }, [selectedCohortId, loadContext]);

  async function persistForm(nextForm: FormState, silent = false) {
    if (selectedCohortId === null) {
      return;
    }

    const serialized = JSON.stringify(nextForm);
    if (serialized === JSON.stringify(lastSavedForm.current)) {
      return;
    }

    setIsSaving(true);

    try {
      const { data } = await saveDocumentFields(
        selectedCohortId,
        formToInput(nextForm)
      );
      const refreshed = await fetchDocumentContext(selectedCohortId);
      setContext(refreshed);
      const savedForm = dataToForm(data);
      setForm(savedForm);
      lastSavedForm.current = savedForm;

      if (!silent) {
        toast.success("Данные сохранены");
      }
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Не удалось сохранить данные";
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  function updateField(key: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleBlur() {
    await persistForm(form, true);
  }

  async function handleSaveClick() {
    await persistForm(form);
  }

  async function handleGenerate(documentType: DocumentType) {
    if (selectedCohortId === null) {
      return;
    }

    setGeneratingType(documentType);
    setError(null);

    try {
      const { blob, filename } = await generateDocument(
        documentType,
        selectedCohortId
      );
      triggerFileDownload(blob, filename);
      toast.success("Документ сформирован");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Не удалось сформировать документ";
      setError(message);
      toast.error(message);
    } finally {
      setGeneratingType(null);
    }
  }

  async function handleReportUpload(file: File) {
    if (selectedCohortId === null) {
      return;
    }

    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith(".pdf") && !lowerName.endsWith(".docx")) {
      setError("Допустимы только файлы .docx и .pdf");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      await uploadReport(selectedCohortId, file);
      await loadContext(selectedCohortId);
      toast.success("Отчёт загружен");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Не удалось загрузить отчёт";
      setError(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Документы недоступны</CardTitle>
          <CardDescription>
            Сначала подайте заявку в когорту — после этого здесь появится форма
            документов.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const selectedApplication = applications.find(
    (application) => application.cohortId === selectedCohortId
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Когорта</CardTitle>
            <CardDescription>
              Данные документов хранятся отдельно для каждой когорты.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={selectedCohortId?.toString() ?? ""}
              onValueChange={(value) => setSelectedCohortId(Number(value))}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Выберите когорту" />
              </SelectTrigger>
              <SelectContent>
                {applications.map((application) => (
                  <SelectItem
                    key={application.cohortId}
                    value={application.cohortId.toString()}
                  >
                    {application.cohort.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedApplication && (
              <Badge
                variant={applicationStatusVariants[selectedApplication.status]}
              >
                {selectedApplication.statusLabel}
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {error && <p className="text-destructive text-sm">{error}</p>}
      {isLoading && (
        <p className="text-muted-foreground text-sm">Загрузка документов...</p>
      )}

      {context && !isLoading && (
        <>
          <Card>
            <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <CardTitle>Поля документов</CardTitle>
                <CardDescription>
                  Заполняются один раз и используются во всех документах когорты.
                  Автосохранение при потере фокуса.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => void handleSaveClick()}
                  disabled={isSaving}
                >
                  {isSaving ? "Сохранение..." : "Сохранить"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {FIELD_CONFIG.map((field) => (
                <div
                  key={field.key}
                  className={field.multiline ? "sm:col-span-2 space-y-2" : "space-y-2"}
                >
                  <Label htmlFor={field.key}>{field.label}</Label>
                  {field.multiline ? (
                    <Textarea
                      id={field.key}
                      value={form[field.key]}
                      onChange={(event) =>
                        updateField(field.key, event.target.value)
                      }
                      onBlur={() => void handleBlur()}
                      rows={4}
                    />
                  ) : (
                    <Input
                      id={field.key}
                      value={form[field.key]}
                      onChange={(event) =>
                        updateField(field.key, event.target.value)
                      }
                      onBlur={() => void handleBlur()}
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-3">
            {DOCUMENT_TYPES.map((documentType) => {
              const availability = context.availability[documentType];

              return (
                <Card key={documentType}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {DOCUMENT_TYPE_LABELS[documentType]}
                    </CardTitle>
                    <CardDescription>
                      {availability.canGenerate
                        ? "Все условия выполнены"
                        : availability.blockedReason ??
                          (availability.missingStudentFields.length > 0
                            ? `Заполните: ${availability.missingStudentFields.join(", ")}`
                            : "Условия не выполнены")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      size="sm"
                      disabled={!availability.canGenerate || generatingType !== null}
                      onClick={() => void handleGenerate(documentType)}
                    >
                      {generatingType === documentType
                        ? "Формирование..."
                        : "Сформировать документ"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Отчёт о практике</CardTitle>
              <CardDescription>
                Загрузите файл .docx или .pdf. После проверки администратором
                станет доступен титульный лист.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {context.data.reportFileUrl ? (
                <p className="text-sm">
                  Файл загружен
                  {context.data.reportAdminApproved
                    ? " — администратор допустил к скачиванию титульного листа"
                    : " — ожидается проверка администратором"}
                </p>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Отчёт ещё не загружен
                </p>
              )}

              <div>
                <Input
                  type="file"
                  accept=".docx,.pdf"
                  disabled={isUploading || context.applicationStatus !== "APPROVED"}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void handleReportUpload(file);
                      event.target.value = "";
                    }
                  }}
                />
                {isUploading && (
                  <p className="text-muted-foreground mt-2 text-sm">
                    Загрузка отчёта...
                  </p>
                )}
                {context.applicationStatus !== "APPROVED" && (
                  <p className="text-muted-foreground mt-2 text-sm">
                    Загрузка отчёта доступна после одобрения заявки.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
