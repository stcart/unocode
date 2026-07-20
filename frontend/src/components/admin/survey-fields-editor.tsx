"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import {
  createSurveyField,
  deleteSurveyField,
  updateSurveyField,
} from "@/lib/api/admin";
import type { SurveyField, SurveyFieldType } from "@/lib/types/cohort";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const fieldTypeLabels: Record<SurveyFieldType, string> = {
  TEXT: "Короткий текст",
  LONG_TEXT: "Длинный текст",
  SELECT: "Выбор из списка",
};

type SurveyFieldsEditorProps = {
  cohortId: number;
  fields: SurveyField[];
  onChange: (fields: SurveyField[]) => void;
};

export function SurveyFieldsEditor({
  cohortId,
  fields,
  onChange,
}: SurveyFieldsEditorProps) {
  const [label, setLabel] = useState("");
  const [type, setType] = useState<SurveyFieldType>("TEXT");
  const [optionsText, setOptionsText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const options =
        type === "SELECT"
          ? optionsText
              .split(",")
              .map((option) => option.trim())
              .filter(Boolean)
          : [];

      const { surveyField } = await createSurveyField(cohortId, {
        label,
        type,
        options,
      });

      onChange([...fields, surveyField]);
      setLabel("");
      setOptionsText("");
      setType("TEXT");
      toast.success("Поле анкеты добавлено");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Не удалось добавить поле";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(fieldId: number) {
    setError(null);
    setIsDeleting(true);

    try {
      await deleteSurveyField(cohortId, fieldId);
      onChange(fields.filter((field) => field.id !== fieldId));
      toast.success("Поле удалено");
      setPendingDeleteId(null);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Не удалось удалить поле";
      setError(message);
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleMove(field: SurveyField, direction: "up" | "down") {
    const index = fields.findIndex((item) => item.id === field.id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;

    if (swapIndex < 0 || swapIndex >= fields.length) {
      return;
    }

    const otherField = fields[swapIndex];

    try {
      const [updatedField, updatedOtherField] = await Promise.all([
        updateSurveyField(cohortId, field.id, {
          label: field.label,
          type: field.type,
          options: field.options,
          sortOrder: otherField.sortOrder,
        }),
        updateSurveyField(cohortId, otherField.id, {
          label: otherField.label,
          type: otherField.type,
          options: otherField.options,
          sortOrder: field.sortOrder,
        }),
      ]);

      const nextFields = [...fields];
      nextFields[index] = updatedField.surveyField;
      nextFields[swapIndex] = updatedOtherField.surveyField;
      nextFields.sort((a, b) => a.sortOrder - b.sortOrder);
      onChange(nextFields);
      toast.success("Порядок полей обновлён");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Не удалось изменить порядок";
      setError(message);
      toast.error(message);
    }
  }

  return (
    <div className="space-y-6">
      <form className="space-y-4 rounded-lg border p-4" onSubmit={handleAdd}>
        <div className="space-y-2">
          <Label htmlFor="survey-label">Вопрос</Label>
          <Input
            id="survey-label"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="ФИО"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="survey-type">Тип поля</Label>
          <select
            id="survey-type"
            value={type}
            onChange={(event) => setType(event.target.value as SurveyFieldType)}
            className="border-input bg-background flex h-9 w-full rounded-lg border px-3 text-sm"
          >
            <option value="TEXT">Короткий текст</option>
            <option value="LONG_TEXT">Длинный текст</option>
            <option value="SELECT">Выбор из списка</option>
          </select>
        </div>

        {type === "SELECT" && (
          <div className="space-y-2">
            <Label htmlFor="survey-options">Варианты (через запятую)</Label>
            <Input
              id="survey-options"
              value={optionsText}
              onChange={(event) => setOptionsText(event.target.value)}
              placeholder="Frontend, Backend, Аналитик"
              required
            />
          </div>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Добавление..." : "Добавить поле"}
        </Button>
      </form>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {fields.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Поля анкеты пока не добавлены.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Вопрос</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Варианты</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => (
              <TableRow key={field.id}>
                <TableCell>{field.label}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{fieldTypeLabels[field.type]}</Badge>
                </TableCell>
                <TableCell>
                  {field.options.length > 0 ? field.options.join(", ") : "—"}
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={index === 0}
                    onClick={() => void handleMove(field, "up")}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={index === fields.length - 1}
                    onClick={() => void handleMove(field, "down")}
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setPendingDeleteId(field.id)}
                  >
                    Удалить
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ConfirmDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
        title="Удалить поле анкеты?"
        description="Ответы кандидатов по этому полю могут остаться в уже поданных заявках."
        confirmLabel="Удалить"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={() =>
          pendingDeleteId !== null ? void handleDelete(pendingDeleteId) : undefined
        }
      />
    </div>
  );
}
