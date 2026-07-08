"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminRoute } from "@/components/admin-route";
import { CohortForm } from "@/components/admin/cohort-form";
import { CohortRolesEditor } from "@/components/admin/cohort-roles-editor";
import { SurveyFieldsEditor } from "@/components/admin/survey-fields-editor";
import { TestTaskEditor } from "@/components/admin/test-task-editor";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiError } from "@/lib/api";
import { fetchCohort, updateCohort } from "@/lib/api/admin";
import type { CohortDetail } from "@/lib/types/cohort";

function CohortDetailPageContent() {
  const params = useParams<{ id: string }>();
  const cohortId = Number(params.id);
  const [cohort, setCohort] = useState<CohortDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCohort() {
      if (!Number.isInteger(cohortId) || cohortId <= 0) {
        setError("Некорректный ID когорты");
        setIsLoading(false);
        return;
      }

      try {
        const data = await fetchCohort(cohortId);
        setCohort(data.cohort);
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : "Не удалось загрузить когорту"
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadCohort();
  }, [cohortId]);

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-10">
        <p className="text-muted-foreground text-sm">Загрузка...</p>
      </div>
    );
  }

  if (error || !cohort) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 py-10">
        <p className="text-destructive text-sm">{error ?? "Когорта не найдена"}</p>
        <Link href="/admin/cohorts" className="text-sm underline-offset-4 hover:underline">
          ← К списку когорт
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="space-y-2">
        <Link
          href="/admin/cohorts"
          className="text-muted-foreground text-sm underline-offset-4 hover:underline"
        >
          ← К списку когорт
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            Когорта {cohort.name}
          </h1>
          <Badge variant="secondary">
            Заявок: {cohort.applicationsCount}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Публичная ссылка на анкету:{" "}
          <Link
            href={`/apply/${cohort.id}`}
            className="text-foreground underline-offset-4 hover:underline"
          >
            /apply/{cohort.id}
          </Link>
        </p>
      </div>

      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
          <TabsTrigger value="survey">Анкета</TabsTrigger>
          <TabsTrigger value="roles">Роли</TabsTrigger>
          <TabsTrigger value="test-task">Тестовое</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Основные параметры</CardTitle>
              <CardDescription>
                Даты приёма заявок и сроки практики используются в документах и
                модуле задач.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CohortForm
                initialValues={{
                  name: cohort.name,
                  applicationStart: cohort.applicationStart,
                  applicationEnd: cohort.applicationEnd,
                  practiceStart: cohort.practiceStart,
                  practiceEnd: cohort.practiceEnd,
                }}
                submitLabel="Сохранить изменения"
                onSubmit={async (values) => {
                  const { cohort: updatedCohort } = await updateCohort(
                    cohort.id,
                    values
                  );
                  setCohort(updatedCohort);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="survey">
          <Card>
            <CardHeader>
              <CardTitle>Конструктор анкеты</CardTitle>
              <CardDescription>
                Поля анкеты для кандидатов этой когорты.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SurveyFieldsEditor
                cohortId={cohort.id}
                fields={cohort.surveyFields}
                onChange={(surveyFields) =>
                  setCohort({ ...cohort, surveyFields })
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Роли / треки</CardTitle>
              <CardDescription>
                Список направлений, которые админ сможет назначать после одобрения
                заявки.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CohortRolesEditor
                cohortId={cohort.id}
                roles={cohort.cohortRoles}
                onChange={(cohortRoles) =>
                  setCohort({ ...cohort, cohortRoles })
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test-task">
          <Card>
            <CardHeader>
              <CardTitle>Тестовое задание</CardTitle>
              <CardDescription>
                Текст задания и управление публикацией для кандидатов.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TestTaskEditor
                cohortId={cohort.id}
                testTask={cohort.testTask}
                onChange={(testTask) => setCohort({ ...cohort, testTask })}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function CohortDetailPage() {
  return (
    <AdminRoute>
      <CohortDetailPageContent />
    </AdminRoute>
  );
}
