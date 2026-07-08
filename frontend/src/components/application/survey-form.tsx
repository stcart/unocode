"use client";

import { useState } from "react";
import Link from "next/link";
import { ApiError } from "@/lib/api";
import type {
  ApplicationAnswerInput,
  PublicSurveyField,
} from "@/lib/types/application";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type SurveyFormProps = {
  cohortId: number;
  fields: PublicSurveyField[];
  initialValues: Record<number, string>;
  isAuthenticated: boolean;
  isApplicationOpen: boolean;
  returnUrl: string;
  onSubmit: (answers: ApplicationAnswerInput[]) => Promise<void>;
};

export function SurveyForm({
  cohortId,
  fields,
  initialValues,
  isAuthenticated,
  isApplicationOpen,
  returnUrl,
  onSubmit,
}: SurveyFormProps) {
  const [values, setValues] = useState<Record<number, string>>(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateValue(fieldId: number, value: string) {
    setValues((current) => ({ ...current, [fieldId]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isAuthenticated) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const answers = fields.map((field) => ({
        surveyFieldId: field.id,
        value: values[field.id]?.trim() ?? "",
      }));

      await onSubmit(answers);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Не удалось отправить заявку"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (fields.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Анкета для когорты {cohortId} ещё не настроена администратором.
      </p>
    );
  }

  if (!isApplicationOpen) {
    return (
      <p className="text-muted-foreground text-sm">
        Приём заявок для этой когорты сейчас закрыт.
      </p>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <Label htmlFor={`field-${field.id}`}>{field.label}</Label>

          {field.type === "LONG_TEXT" ? (
            <Textarea
              id={`field-${field.id}`}
              value={values[field.id] ?? ""}
              onChange={(event) => updateValue(field.id, event.target.value)}
              required
              rows={4}
            />
          ) : field.type === "SELECT" ? (
            <select
              id={`field-${field.id}`}
              value={values[field.id] ?? ""}
              onChange={(event) => updateValue(field.id, event.target.value)}
              required
              className="border-input bg-background flex h-9 w-full rounded-lg border px-3 text-sm"
            >
              <option value="" disabled>
                Выберите вариант
              </option>
              {field.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <Input
              id={`field-${field.id}`}
              value={values[field.id] ?? ""}
              onChange={(event) => updateValue(field.id, event.target.value)}
              required
            />
          )}
        </div>
      ))}

      {error && <p className="text-destructive text-sm">{error}</p>}

      {isAuthenticated ? (
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Отправка..." : "Подать заявку"}
        </Button>
      ) : (
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">
            Чтобы отправить анкету, нужно войти или зарегистрироваться.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/login?returnUrl=${encodeURIComponent(returnUrl)}`}
              className={cn(buttonVariants())}
            >
              Войти
            </Link>
            <Link
              href={`/register?returnUrl=${encodeURIComponent(returnUrl)}`}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Регистрация
            </Link>
          </div>
        </div>
      )}
    </form>
  );
}
