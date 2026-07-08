"use client";

import type { TestTaskState } from "@/lib/types/application";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type TestTaskSectionProps = {
  testTask: TestTaskState | null;
  isLoading: boolean;
};

export function TestTaskSection({ testTask, isLoading }: TestTaskSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Тестовое задание</CardTitle>
        <CardDescription>
          Доступно только после отправки анкеты.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <p className="text-muted-foreground text-sm">Загрузка...</p>
        )}

        {!isLoading && testTask?.state === "not_configured" && (
          <p className="text-muted-foreground text-sm">
            Тестовое задание для этой когорты ещё не настроено.
          </p>
        )}

        {!isLoading && testTask?.state === "not_published" && (
          <p className="text-muted-foreground text-sm">
            Задание появится позже. Мы уведомим вас на email, когда оно будет
            опубликовано.
          </p>
        )}

        {!isLoading && testTask?.state === "available" && (
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              Опубликовано:{" "}
              {new Date(testTask.publishedAt).toLocaleString("ru-RU")}
            </p>
            <div className="rounded-lg border p-4 whitespace-pre-wrap text-sm">
              {testTask.content}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
