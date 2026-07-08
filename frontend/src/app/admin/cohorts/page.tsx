"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminRoute } from "@/components/admin-route";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError } from "@/lib/api";
import { fetchCohorts } from "@/lib/api/admin";
import type { CohortListItem } from "@/lib/types/cohort";
import { cn } from "@/lib/utils";

function CohortsPageContent() {
  const [cohorts, setCohorts] = useState<CohortListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCohorts() {
      try {
        const data = await fetchCohorts();
        setCohorts(data.cohorts);
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : "Не удалось загрузить когорты"
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadCohorts();
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Когорты</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Управление потоками практики, анкетами, ролями и тестовыми заданиями.
          </p>
        </div>
        <Link href="/admin/cohorts/new" className={cn(buttonVariants())}>
          Создать когорту
        </Link>
      </div>

      {isLoading && (
        <p className="text-muted-foreground text-sm">Загрузка...</p>
      )}

      {error && <p className="text-destructive text-sm">{error}</p>}

      {!isLoading && !error && cohorts.length === 0 && (
        <p className="text-muted-foreground text-sm">
          Когорт пока нет. Создайте первую, например «2026».
        </p>
      )}

      {cohorts.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Приём заявок</TableHead>
              <TableHead>Практика</TableHead>
              <TableHead>Анкета</TableHead>
              <TableHead>Роли</TableHead>
              <TableHead>Тест</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cohorts.map((cohort) => (
              <TableRow key={cohort.id}>
                <TableCell className="font-medium">{cohort.name}</TableCell>
                <TableCell>
                  {cohort.applicationStart} — {cohort.applicationEnd}
                </TableCell>
                <TableCell>
                  {cohort.practiceStart} — {cohort.practiceEnd}
                </TableCell>
                <TableCell>{cohort.surveyFieldsCount}</TableCell>
                <TableCell>{cohort.cohortRolesCount}</TableCell>
                <TableCell>
                  {cohort.testTaskPublished ? (
                    <Badge>Опубликовано</Badge>
                  ) : (
                    <Badge variant="secondary">Черновик</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/admin/cohorts/${cohort.id}`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    Настроить
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export default function AdminCohortsPage() {
  return (
    <AdminRoute>
      <CohortsPageContent />
    </AdminRoute>
  );
}
