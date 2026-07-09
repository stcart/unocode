"use client";

import { TaskBoardView } from "@/components/tasks/task-board";

type AdminTasksTabProps = {
  cohortId: number;
};

export function AdminTasksTab({ cohortId }: AdminTasksTabProps) {
  return <TaskBoardView mode="admin" cohortId={cohortId} />;
}
