"use client";

import { useEffect, useState } from "react";
import type { Application } from "@/lib/types/application";
import { TaskBoardView } from "@/components/tasks/task-board";
import {
  Card,
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
import { useAuth } from "@/providers/auth-provider";

type TasksTabProps = {
  applications: Application[];
};

export function TasksTab({ applications }: TasksTabProps) {
  const { user } = useAuth();
  const approvedApplications = applications.filter(
    (application) => application.status === "APPROVED"
  );
  const [selectedCohortId, setSelectedCohortId] = useState<number | null>(null);

  useEffect(() => {
    if (approvedApplications.length > 0 && selectedCohortId === null) {
      setSelectedCohortId(approvedApplications[0].cohortId);
    }
  }, [approvedApplications, selectedCohortId]);

  if (approvedApplications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Задачи недоступны</CardTitle>
          <CardDescription>
            Раздел задач откроется после одобрения заявки в когорте.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!user || selectedCohortId === null) {
    return null;
  }

  return (
    <div className="space-y-4">
      {approvedApplications.length > 1 && (
        <Card>
          <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base">Когорта</CardTitle>
              <CardDescription>
                Сетка задач строится по датам практики выбранной когорты.
              </CardDescription>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tasks-cohort">Когорта</Label>
              <Select
                value={selectedCohortId.toString()}
                onValueChange={(value) => setSelectedCohortId(Number(value))}
              >
                <SelectTrigger id="tasks-cohort" className="w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {approvedApplications.map((application) => (
                    <SelectItem
                      key={application.cohortId}
                      value={application.cohortId.toString()}
                    >
                      {application.cohort.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
        </Card>
      )}

      <TaskBoardView
        mode="student"
        cohortId={selectedCohortId}
        currentUserId={user.id}
      />
    </div>
  );
}
