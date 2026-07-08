"use client";

import type { ApplicationStatus } from "@/lib/types/application";
import { applicationStatusVariants } from "@/lib/application-status";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const statusVariants = applicationStatusVariants;

type ApplicationStatusCardProps = {
  status: ApplicationStatus;
  statusLabel: string;
  reviewComment?: string | null;
  submittedAt?: string;
};

export function ApplicationStatusCard({
  status,
  statusLabel,
  reviewComment,
  submittedAt,
}: ApplicationStatusCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Статус заявки</CardTitle>
        <CardDescription>
          {submittedAt
            ? `Подана ${new Date(submittedAt).toLocaleString("ru-RU")}`
            : "Заявка отправлена"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Badge variant={statusVariants[status]}>{statusLabel}</Badge>

        {status === "REJECTED" && reviewComment && (
          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground mb-1 text-sm">Комментарий</p>
            <p className="text-sm">{reviewComment}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
