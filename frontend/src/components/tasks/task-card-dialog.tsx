"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import type { TaskCard, TaskCardInput } from "@/lib/types/task";
import { formatDateRu, formatDateTime } from "@/lib/workdays";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

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
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="sm:max-w-lg" showCloseButton={false}>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {canEdit ? "Карточка задачи" : "Просмотр карточки"}
            </DialogTitle>
            {date && (
              <DialogDescription>
                Дата: {formatDateRu(date)}
              </DialogDescription>
            )}
          </DialogHeader>

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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Закрыть
            </Button>
            {canEdit && (
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Сохранение..." : "Сохранить"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
