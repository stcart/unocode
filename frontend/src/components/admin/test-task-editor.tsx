"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import {
  publishTestTask,
  saveTestTask,
  unpublishTestTask,
} from "@/lib/api/admin";
import type { TestTask } from "@/lib/types/cohort";
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

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const { testTask: savedTask } = await saveTestTask(cohortId, content);
      onChange(savedTask);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось сохранить задание");
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
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось опубликовать");
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
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось снять с публикации");
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
              onClick={() => void handleUnpublish()}
            >
              Снять с публикации
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              disabled={isPublishing || !testTask}
              onClick={() => void handlePublish()}
            >
              {isPublishing ? "Публикация..." : "Опубликовать"}
            </Button>
          )}
        </div>
      </form>

      <p className="text-muted-foreground text-sm">
        Кандидаты увидят задание только после отправки анкеты (Этап 4).
        При публикации на backend пишется заглушка email-уведомления в консоль.
      </p>
    </div>
  );
}
