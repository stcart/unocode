"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { applicationStatusVariants } from "@/lib/application-status";
import { ApiError } from "@/lib/api";
import { fetchCohortApplications, reviewApplication } from "@/lib/api/admin";
import type { AdminApplication } from "@/lib/types/admin";
import type { CohortRole } from "@/lib/types/cohort";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type AdminApplicationsTabProps = {
  cohortId: number;
  roles: CohortRole[];
};

export function AdminApplicationsTab({
  cohortId,
  roles,
}: AdminApplicationsTabProps) {
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [rejectComment, setRejectComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false);

  const selected = applications.find(
    (application) => application.id === selectedId
  );

  async function loadApplications() {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchCohortApplications(cohortId);
      setApplications(data.applications);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Не удалось загрузить заявки"
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadApplications();
  }, [cohortId]);

  async function handleReview(
    applicationId: number,
    input: Parameters<typeof reviewApplication>[2],
    successMessage?: string
  ) {
    setIsSaving(true);
    setError(null);

    try {
      const { application } = await reviewApplication(
        cohortId,
        applicationId,
        input
      );
      setApplications((current) =>
        current.map((item) =>
          item.id === application.id ? application : item
        )
      );
      setRejectComment("");
      if (successMessage) {
        toast.success(successMessage);
      }
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Не удалось обновить заявку";
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmReject() {
    if (!selected) {
      return;
    }

    await handleReview(
      selected.id,
      {
        status: "REJECTED",
        reviewComment: rejectComment,
      },
      "Заявка отклонена"
    );
    setConfirmRejectOpen(false);
  }

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Загрузка заявок...</p>;
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-destructive text-sm">{error}</p>}

      {applications.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Заявок пока нет</CardTitle>
            <CardDescription>
              Когда кандидаты подадут анкету, они появятся в этом списке.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Роль</TableHead>
              <TableHead>Подана</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application.id}>
                <TableCell>{application.user.email}</TableCell>
                <TableCell>
                  <Badge variant={applicationStatusVariants[application.status]}>
                    {application.statusLabel}
                  </Badge>
                </TableCell>
                <TableCell>{application.role?.name ?? "—"}</TableCell>
                <TableCell>
                  {new Date(application.createdAt).toLocaleString("ru-RU")}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedId(application.id);
                      setRejectComment(application.reviewComment ?? "");
                    }}
                  >
                    Открыть
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {selected && (
        <Card>
          <CardHeader>
            <CardTitle>Анкета кандидата</CardTitle>
            <CardDescription>{selected.user.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {selected.answers.map((answer) => (
                <div key={answer.surveyFieldId} className="rounded-lg border p-3">
                  <p className="text-muted-foreground mb-1 text-sm">
                    {answer.label}
                  </p>
                  <p className="text-sm whitespace-pre-wrap">{answer.value}</p>
                </div>
              ))}
            </div>

            {selected.status === "PENDING" && (
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={isSaving}
                  onClick={() =>
                    void handleReview(selected.id, { status: "APPROVED" }, "Заявка одобрена")
                  }
                >
                  Одобрить
                </Button>
              </div>
            )}

            {selected.status !== "REJECTED" && (
              <div className="space-y-2">
                <Label htmlFor="reject-comment">
                  Комментарий при отклонении
                </Label>
                <Textarea
                  id="reject-comment"
                  value={rejectComment}
                  onChange={(event) => setRejectComment(event.target.value)}
                  rows={3}
                />
                {selected.status === "PENDING" && (
                  <Button
                    variant="destructive"
                    disabled={isSaving}
                    onClick={() => setConfirmRejectOpen(true)}
                  >
                    Отклонить
                  </Button>
                )}
              </div>
            )}

            {selected.status === "REJECTED" && selected.reviewComment && (
              <div className="rounded-lg border p-3">
                <p className="text-muted-foreground mb-1 text-sm">
                  Комментарий администратора
                </p>
                <p className="text-sm">{selected.reviewComment}</p>
              </div>
            )}

            {selected.status === "APPROVED" && (
              <div className="space-y-2">
                <Label>Роль / трек</Label>
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={selected.roleId?.toString() ?? ""}
                    onValueChange={(value) =>
                      void handleReview(
                        selected.id,
                        { roleId: Number(value) },
                        "Роль назначена"
                      )
                    }
                  >
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="Выберите роль" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {roles.length === 0 && (
                    <p className="text-muted-foreground text-sm">
                      Сначала добавьте роли во вкладке «Управление когортой».
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={confirmRejectOpen}
        onOpenChange={setConfirmRejectOpen}
        title="Отклонить заявку?"
        description="Кандидат увидит ваш комментарий в личном кабинете."
        confirmLabel="Отклонить"
        variant="destructive"
        isLoading={isSaving}
        onConfirm={confirmReject}
      />
    </div>
  );
}
