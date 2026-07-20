"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import {
  publishTestTask,
  saveTestTask,
  unpublishTestTask,
} from "@/lib/api/admin";
import type { TestTask } from "@/lib/types/cohort";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type TestTaskEditorProps = {
  cohortId: number;
  testTask: TestTask | null;
  onChange: (testTask: TestTask | null) => void;
};

export function TestTaskEditor({
  cohortId,
  testTask,
  onChange,
}: TestTaskEditorProps) {
  const [content, setContent] = useState(testTask?.content ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "publish" | "unpublish" | null
  >(null);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const { testTask: savedTask } = await saveTestTask(cohortId, content);
      onChange(savedTask);
      toast.success("Текст задания сохранён");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Не удалось сохранить задание";
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePublish() {
    setError(null);
    setIsPublishing(true);

    try {
      const { testTask: publishedTask } = await publishTestTask(cohortId);
      onChange(publishedTask);
      toast.success("Тестовое задание опубликовано");
      setConfirmAction(null);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Не удалось опубликовать";
      setError(message);
      toast.error(message);
    } finally {
      setIsPublishing(false);
    }
  }

  async function handleUnpublish() {
    setError(null);
    setIsPublishing(true);

    try {
      const { testTask: unpublishedTask } = await unpublishTestTask(cohortId);
      onChange(unpublishedTask);
      toast.success("Публикация снята");
      setConfirmAction(null);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Не удалось снять с публикации";
      setError(message);
      toast.error(message);
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Статус:</span>
        {testTask?.publishedAt ? (
          <Badge>Опубликовано</Badge>
        ) : (
          <Badge variant="secondary">Черновик</Badge>
        )}
        {testTask?.publishedAt && (
          <span className="text-muted-foreground text-sm">
            {new Date(testTask.publishedAt).toLocaleString("ru-RU")}
          </span>
        )}
      </div>

      <form className="space-y-4" onSubmit={handleSave}>
        <div className="space-y-2">
          <Label htmlFor="test-task-content">Текст тестового задания</Label>
          <Textarea
            id="test-task-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={12}
            placeholder="Опишите тестовое задание для кандидатов..."
            required
          />
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Сохранение..." : "Сохранить текст"}
          </Button>

          {testTask?.publishedAt ? (
            <Button
              type="button"
              variant="outline"
              disabled={isPublishing}
              onClick={() => setConfirmAction("unpublish")}
            >
              Снять с публикации
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              disabled={isPublishing || !testTask}
              onClick={() => setConfirmAction("publish")}
            >
              {isPublishing ? "Публикация..." : "Опубликовать"}
            </Button>
          )}
        </div>
      </form>

      <ConfirmDialog
        open={confirmAction === "publish"}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title="Опубликовать тестовое задание?"
        description="Кандидаты с поданными анкетами смогут увидеть текст задания."
        confirmLabel="Опубликовать"
        isLoading={isPublishing}
        onConfirm={handlePublish}
      />

      <ConfirmDialog
        open={confirmAction === "unpublish"}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title="Снять задание с публикации?"
        description="Кандидаты временно не смогут открыть текст задания."
        confirmLabel="Снять с публикации"
        variant="destructive"
        isLoading={isPublishing}
        onConfirm={handleUnpublish}
      />
    </div>
  );
}
