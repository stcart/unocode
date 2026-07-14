"use client";

import { useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api";
import type { TaskCard, TaskCardInput } from "@/lib/types/task";
import { formatDateRu, formatDateTime } from "@/lib/workdays";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type TaskCardDialogProps = {
  open: boolean;
  date: string | null;
  card: TaskCard | null;
  canEdit: boolean;
  onClose: () => void;
  onSave: (card: TaskCard) => void;
  onSaveRequest: (
    date: string,
    input: TaskCardInput
  ) => Promise<TaskCard>;
};

type FormState = {
  title: string;
  description: string;
  artifactLink: string;
};

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  artifactLink: "",
};

export function TaskCardDialog({
  open,
  date,
  card,
  canEdit,
  onClose,
  onSave,
  onSaveRequest,
}: TaskCardDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm({
      title: card?.title ?? "",
      description: card?.description ?? "",
      artifactLink: card?.artifactLink ?? "",
    });
    setError(null);
  }, [open, card]);

  async function handleSubmit() {
    if (!date || !canEdit) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const saved = await onSaveRequest(date, {
        title: form.title,
        description: form.description,
        artifactLink: form.artifactLink,
      });
      onSave(saved);
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Не удалось сохранить карточку"
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="fixed top-1/2 left-1/2 m-0 w-[min(100%-2rem,32rem)] max-h-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-background p-0 shadow-lg backdrop:bg-black/50"
      onClose={onClose}
    >
      <form
        method="dialog"
        className="flex flex-col gap-4 p-6"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">
            {canEdit ? "Карточка задачи" : "Просмотр карточки"}
          </h2>
          {date && (
            <p className="text-muted-foreground text-sm">
              Дата: {formatDateRu(date)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="task-title">Название / описание задачи</Label>
          <Input
            id="task-title"
            value={form.title}
            disabled={!canEdit || isSaving}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="task-description">Что было сделано</Label>
          <Textarea
            id="task-description"
            rows={4}
            value={form.description}
            disabled={!canEdit || isSaving}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="task-artifact">Ссылка на артефакт</Label>
          <Input
            id="task-artifact"
            value={form.artifactLink}
            disabled={!canEdit || isSaving}
            placeholder="GitHub, Figma, скриншот..."
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                artifactLink: event.target.value,
              }))
            }
          />
        </div>

        {card?.updatedAt && (
          <p className="text-muted-foreground text-sm">
            Обновлено: {formatDateTime(card.updatedAt)}
          </p>
        )}

        {error && <p className="text-destructive text-sm">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Закрыть
          </Button>
          {canEdit && (
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Сохранение..." : "Сохранить"}
            </Button>
          )}
        </div>
      </form>
    </dialog>
  );
}
