"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FolderOpen, Plus } from "lucide-react";
import { AdminRoute } from "@/components/admin-route";
import {
  EmptyState,
  PageContainer,
  PageHeader,
  PageLoadingSkeleton,
} from "@/components/page-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <PageContainer className="gap-8">
      <PageHeader
        eyebrow="Администрирование"
        title="Когорты"
        description="Выберите поток практики для работы с заявками, документами и задачами."
        actions={
          <Link href="/admin/cohorts/new" className={cn(buttonVariants())}>
            <Plus data-icon="inline-start" />
            Создать когорту
          </Link>
        }
      />

      {isLoading && <PageLoadingSkeleton />}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && cohorts.length === 0 && (
        <EmptyState
          icon={FolderOpen}
          title="Когорт пока нет"
          description="Создайте первый поток, например «2026»."
          action={
            <Link href="/admin/cohorts/new" className={cn(buttonVariants())}>
              Создать когорту
            </Link>
          }
        />
      )}

      {cohorts.length > 0 && (
        <Card className="bg-card/90 overflow-hidden backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
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
                      <TableCell className="text-muted-foreground">
                        {cohort.applicationStart} — {cohort.applicationEnd}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
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
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" })
                          )}
                        >
                          Открыть
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}

export default function AdminCohortsPage() {
  return (
    <AdminRoute>
      <CohortsPageContent />
    </AdminRoute>
  );
}
