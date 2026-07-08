"use client";

import Link from "next/link";
import type { Application } from "@/lib/types/application";
import { applicationStatusVariants } from "@/lib/application-status";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ApplicationsTabProps = {
  applications: Application[];
  isLoading: boolean;
  error: string | null;
};

export function ApplicationsTab({
  applications,
  isLoading,
  error,
}: ApplicationsTabProps) {
  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Загрузка заявок...</p>;
  }

  if (error) {
    return <p className="text-destructive text-sm">{error}</p>;
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Заявок пока нет</CardTitle>
          <CardDescription>
            Перейдите по ссылке когорты от администратора, чтобы подать заявку
            на практику.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <Card key={application.id}>
          <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle>{application.cohort.name}</CardTitle>
              <CardDescription>
                Подана{" "}
                {new Date(application.createdAt).toLocaleString("ru-RU")}
              </CardDescription>
            </div>
            <Badge variant={applicationStatusVariants[application.status]}>
              {application.statusLabel}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {application.status === "REJECTED" &&
              application.reviewComment && (
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground mb-1 text-sm">
                    Комментарий администратора
                  </p>
                  <p className="text-sm">{application.reviewComment}</p>
                </div>
              )}

            <Link
              href={`/apply/${application.cohortId}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Открыть заявку
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
