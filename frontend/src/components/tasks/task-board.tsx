"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { fetchAdminTaskBoard, fetchTaskBoard, saveTaskCard } from "@/lib/api/tasks";
import type { TaskBoard, TaskCard } from "@/lib/types/task";
import { formatDayLabel } from "@/lib/workdays";
import { TaskCardDialog } from "@/components/tasks/task-card-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { cn } from "@/lib/utils";

type TaskBoardViewProps = {
  mode: "student" | "admin";
  cohortId: number;
  currentUserId?: number;
};

type DialogState = {
  date: string;
  card: TaskCard | null;
  participantUserId: number;
} | null;

export function TaskBoardView({
  mode,
  cohortId,
  currentUserId,
}: TaskBoardViewProps) {
  const [board, setBoard] = useState<TaskBoard | null>(null);
  const [showAll, setShowAll] = useState(mode === "admin");
  const [weekStart, setWeekStart] = useState<string | undefined>();
  const [dialogState, setDialogState] = useState<DialogState>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadBoard = useCallback(
    async (nextWeekStart?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const data =
          mode === "admin"
            ? await fetchAdminTaskBoard(cohortId, nextWeekStart)
            : await fetchTaskBoard(cohortId, {
                weekStart: nextWeekStart,
                showAll,
              });

        setBoard(data);
        setWeekStart(data.weekStart);
      } catch (err) {
        setBoard(null);
        setError(
          err instanceof ApiError
            ? err.message
            : "Не удалось загрузить задачи"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [cohortId, mode, showAll]
  );

  useEffect(() => {
    void loadBoard(weekStart);
  }, [loadBoard, weekStart]);

  useEffect(() => {
    if (mode === "student") {
      setShowAll(false);
    }
  }, [cohortId, mode]);

  function goToWeek(index: number) {
    if (!board || index < 0 || index >= board.weeks.length) {
      return;
    }

    setWeekStart(board.weeks[index]);
  }

  function handleCellClick(
    participantUserId: number,
    date: string,
    card: TaskCard | null
  ) {
    const canEdit =
      mode === "student" && currentUserId === participantUserId;

    if (mode === "admin" && !card) {
      return;
    }

    setDialogState({
      date,
      card,
      participantUserId,
    });
  }

  async function handleSaveCard(
    date: string,
    input: Parameters<typeof saveTaskCard>[2]
  ) {
    const { card } = await saveTaskCard(cohortId, date, input);
    await loadBoard(weekStart);
    return card;
  }

  if (isLoading && !board) {
    return <p className="text-muted-foreground text-sm">Загрузка задач...</p>;
  }

  if (error && !board) {
    return <p className="text-destructive text-sm">{error}</p>;
  }

  if (!board) {
    return null;
  }

  const canEditDialog =
    mode === "student" &&
    dialogState !== null &&
    currentUserId === dialogState.participantUserId;

  return (
    <div className="space-y-4">
      {error && <p className="text-destructive text-sm">{error}</p>}

      <Card>
        <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <CardTitle>
              {board.cohort.name}: {board.cohort.practiceStart} —{" "}
              {board.cohort.practiceEnd}
            </CardTitle>
            <CardDescription>
              Неделя {board.weekIndex + 1} из {board.totalWeeks}
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={board.weekIndex <= 0 || isLoading}
              onClick={() => goToWeek(board.weekIndex - 1)}
            >
              ← Пред.
            </Button>
            <Select
              value={board.weekStart}
              onValueChange={(value) => {
                if (value) {
                  setWeekStart(value);
                }
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {board.weeks.map((week, index) => (
                  <SelectItem key={week} value={week}>
                    Неделя {index + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              disabled={
                board.weekIndex >= board.totalWeeks - 1 || isLoading
              }
              onClick={() => goToWeek(board.weekIndex + 1)}
            >
              След. →
            </Button>
          </div>
        </CardHeader>

        {mode === "student" && (
          <CardContent>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showAll}
                onChange={(event) => {
                  setShowAll(event.target.checked);
                  setWeekStart(undefined);
                }}
              />
              Показать всех
            </label>
          </CardContent>
        )}
      </Card>

      {board.participants.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Участников пока нет</CardTitle>
            <CardDescription>
              Задачи появятся после одобрения заявок в этой когорте.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Участник</TableHead>
                {board.days.map((day) => (
                  <TableHead key={day} className="min-w-[120px] text-center">
                    {formatDayLabel(day)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {board.participants.map((participant) => (
                <TableRow key={participant.userId}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{participant.displayName}</p>
                      {participant.role && (
                        <Badge variant="secondary">{participant.role.name}</Badge>
                      )}
                    </div>
                  </TableCell>
                  {board.days.map((day) => {
                    const card = participant.cards[day];
                    const canEdit =
                      mode === "student" &&
                      currentUserId === participant.userId;
                    const canOpen = canEdit || Boolean(card);

                    return (
                      <TableCell key={`${participant.userId}-${day}`}>
                        <button
                          type="button"
                          disabled={!canOpen}
                          onClick={() =>
                            handleCellClick(participant.userId, day, card)
                          }
                          className={cn(
                            "flex min-h-16 w-full flex-col items-center justify-center rounded-md border px-2 py-2 text-center text-sm transition-colors",
                            canOpen
                              ? "hover:bg-muted cursor-pointer"
                              : "text-muted-foreground cursor-default opacity-60",
                            card && "border-primary/40 bg-primary/5"
                          )}
                        >
                          {card?.title ? (
                            <span className="line-clamp-2">{card.title}</span>
                          ) : canEdit ? (
                            <span className="text-muted-foreground">+</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </button>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <TaskCardDialog
        open={dialogState !== null}
        date={dialogState?.date ?? null}
        card={dialogState?.card ?? null}
        canEdit={canEditDialog}
        onClose={() => setDialogState(null)}
        onSave={() => undefined}
        onSaveRequest={handleSaveCard}
      />
    </div>
  );
}
