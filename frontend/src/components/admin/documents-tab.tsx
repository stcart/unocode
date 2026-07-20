"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import {
  fetchCohortDocuments,
  fetchStudentDocument,
  openStudentReport,
  saveStudentReview,
  setReportApproval,
} from "@/lib/api/admin";
import type { AdminDocumentStudent } from "@/lib/types/admin";
import { DOCUMENT_TYPE_LABELS, type DocumentType } from "@/lib/types/document";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type AdminDocumentsTabProps = {
  cohortId: number;
};

type ReviewForm = {
  reviewActivities: string;
  reviewCharacteristic: string;
  reviewEmployed: string;
  reviewNextPractice: string;
  reviewEmploymentOffer: string;
  reviewSuggestions: string;
  reviewGrade: string;
};

const EMPTY_REVIEW: ReviewForm = {
  reviewActivities: "",
  reviewCharacteristic: "",
  reviewEmployed: "",
  reviewNextPractice: "",
  reviewEmploymentOffer: "",
  reviewSuggestions: "",
  reviewGrade: "",
};

function Indicator({ ready }: { ready: boolean }) {
  return (
    <Badge variant={ready ? "default" : "secondary"}>
      {ready ? "✓" : "✗"}
    </Badge>
  );
}

const DOC_COLUMNS: Array<{ key: DocumentType; label: string }> = [
  { key: "individual-task", label: "ИЗ" },
  { key: "review", label: "Отзыв" },
  { key: "title-page", label: "Титул" },
];

const REVIEW_FIELDS: Array<{ key: keyof ReviewForm; label: string }> = [
  { key: "reviewActivities", label: "Мероприятия за время практики" },
  { key: "reviewCharacteristic", label: "Характеристика уровня подготовки" },
  { key: "reviewEmployed", label: "Трудоустройство на время практики" },
  { key: "reviewNextPractice", label: "Следующая практика в организации" },
  { key: "reviewEmploymentOffer", label: "Предложение трудоустройства" },
  { key: "reviewSuggestions", label: "Предложения и замечания" },
  { key: "reviewGrade", label: "Оценка за практику" },
];

export function AdminDocumentsTab({ cohortId }: AdminDocumentsTabProps) {
  const [students, setStudents] = useState<AdminDocumentStudent[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [reviewForm, setReviewForm] = useState<ReviewForm>(EMPTY_REVIEW);
  const [hasReport, setHasReport] = useState(false);
  const [reportApproved, setReportApproved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const selected = students.find((student) => student.userId === selectedUserId);

  async function loadStudents() {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchCohortDocuments(cohortId);
      setStudents(data.students);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Не удалось загрузить документы"
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadStudents();
  }, [cohortId]);

  async function openStudent(userId: number) {
    setSelectedUserId(userId);
    setError(null);

    try {
      const detail = await fetchStudentDocument(cohortId, userId);
      setReviewForm({
        reviewActivities: detail.data.reviewActivities ?? "",
        reviewCharacteristic: detail.data.reviewCharacteristic ?? "",
        reviewEmployed: detail.data.reviewEmployed ?? "",
        reviewNextPractice: detail.data.reviewNextPractice ?? "",
        reviewEmploymentOffer: detail.data.reviewEmploymentOffer ?? "",
        reviewSuggestions: detail.data.reviewSuggestions ?? "",
        reviewGrade: detail.data.reviewGrade ?? "",
      });
      setHasReport(detail.data.hasReport);
      setReportApproved(detail.data.reportAdminApproved);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Не удалось загрузить данные практиканта"
      );
    }
  }

  async function handleSaveReview() {
    if (selectedUserId === null) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await saveStudentReview(cohortId, selectedUserId, reviewForm);
      await loadStudents();
      await openStudent(selectedUserId);
      toast.success("Отзыв сохранён");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Не удалось сохранить отзыв";
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReportApproval(approved: boolean) {
    if (selectedUserId === null) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await setReportApproval(cohortId, selectedUserId, approved);
      await loadStudents();
      await openStudent(selectedUserId);
      toast.success(
        approved
          ? "Практикант допущен к титульному листу"
          : "Допуск к титульному листу отменён"
      );
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Не удалось обновить допуск к титульному листу";
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Загрузка...</p>;
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-destructive text-sm">{error}</p>}

      {students.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Практикантов пока нет</CardTitle>
            <CardDescription>
              Здесь появятся студенты с одобренными заявками в этой когорте.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ФИО</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Роль</TableHead>
              {DOC_COLUMNS.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
              <TableHead>Отчёт</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.userId}>
                <TableCell className="font-medium">
                  {student.displayName}
                </TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.role?.name ?? "—"}</TableCell>
                {DOC_COLUMNS.map((column) => (
                  <TableCell key={column.key}>
                    <Indicator
                      ready={student.studentFieldCompletion[column.key]}
                    />
                  </TableCell>
                ))}
                <TableCell>
                  {student.hasReport ? (
                    <Badge variant="default">Загружен</Badge>
                  ) : (
                    <Badge variant="secondary">Нет</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void openStudent(student.userId)}
                  >
                    Открыть
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {selected && selectedUserId !== null && (
        <Card>
          <CardHeader>
            <CardTitle>{selected.displayName}</CardTitle>
            <CardDescription>
              {selected.email}
              {selected.role ? ` · ${selected.role.name}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-1">
              <p className="text-sm font-medium">Готовность полей студента</p>
              <div className="flex flex-wrap gap-2">
                {DOC_COLUMNS.map((column) => (
                  <Badge key={column.key} variant="outline">
                    {DOCUMENT_TYPE_LABELS[column.key]}:{" "}
                    {selected.studentFieldCompletion[column.key] ? "✓" : "✗"}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-medium">Отзыв о практике</h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  После сохранения всех полей практикант сможет сформировать
                  документ «Отзыв».
                </p>
              </div>

              <div className="grid gap-4">
                {REVIEW_FIELDS.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key}>{field.label}</Label>
                    <Textarea
                      id={field.key}
                      rows={3}
                      value={reviewForm[field.key]}
                      onChange={(event) =>
                        setReviewForm((current) => ({
                          ...current,
                          [field.key]: event.target.value,
                        }))
                      }
                    />
                  </div>
                ))}
              </div>

              <Button disabled={isSaving} onClick={() => void handleSaveReview()}>
                {isSaving ? "Сохранение..." : "Сохранить отзыв"}
              </Button>
            </div>

            <div className="space-y-3 border-t pt-4">
              <h3 className="font-medium">Отчёт о практике</h3>
              {hasReport ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void openStudentReport(cohortId, selectedUserId)}
                  >
                    Открыть отчёт
                  </Button>
                  <Button
                    size="sm"
                    disabled={isSaving || reportApproved}
                    onClick={() => void handleReportApproval(true)}
                  >
                    Допустить к титульному листу
                  </Button>
                  {reportApproved && (
                    <Badge>Допущен к скачиванию титульного листа</Badge>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Практикант ещё не загрузил отчёт.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
