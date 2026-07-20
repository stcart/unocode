"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import {
  createCohortRole,
  deleteCohortRole,
  updateCohortRole,
} from "@/lib/api/admin";
import type { CohortRole } from "@/lib/types/cohort";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CohortRolesEditorProps = {
  cohortId: number;
  roles: CohortRole[];
  onChange: (roles: CohortRole[]) => void;
};

export function CohortRolesEditor({
  cohortId,
  roles,
  onChange,
}: CohortRolesEditorProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { role } = await createCohortRole(cohortId, name);
      onChange([...roles, role]);
      setName("");
      toast.success("Роль добавлена");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Не удалось добавить роль";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSave(roleId: number) {
    setError(null);

    try {
      const { role } = await updateCohortRole(cohortId, roleId, editingName);
      onChange(roles.map((item) => (item.id === roleId ? role : item)));
      setEditingRoleId(null);
      setEditingName("");
      toast.success("Роль сохранена");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Не удалось сохранить роль";
      setError(message);
      toast.error(message);
    }
  }

  async function handleDelete(roleId: number) {
    setError(null);
    setIsDeleting(true);

    try {
      await deleteCohortRole(cohortId, roleId);
      onChange(roles.filter((role) => role.id !== roleId));
      toast.success("Роль удалена");
      setPendingDeleteId(null);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Не удалось удалить роль";
      setError(message);
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleAdd}>
        <div className="flex-1 space-y-2">
          <Label htmlFor="role-name">Роль / трек</Label>
          <Input
            id="role-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Frontend"
            required
          />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Добавление..." : "Добавить роль"}
        </Button>
      </form>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {roles.length === 0 ? (
        <p className="text-muted-foreground text-sm">Роли пока не добавлены.</p>
      ) : (
        <ul className="space-y-2">
          {roles.map((role) => (
            <li
              key={role.id}
              className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center"
            >
              {editingRoleId === role.id ? (
                <Input
                  value={editingName}
                  onChange={(event) => setEditingName(event.target.value)}
                />
              ) : (
                <span className="flex-1 font-medium">{role.name}</span>
              )}

              <div className="flex gap-2">
                {editingRoleId === role.id ? (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => void handleSave(role.id)}
                    >
                      Сохранить
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingRoleId(null);
                        setEditingName("");
                      }}
                    >
                      Отмена
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingRoleId(role.id);
                        setEditingName(role.name);
                      }}
                    >
                      Изменить
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => setPendingDeleteId(role.id)}
                    >
                      Удалить
                    </Button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
        title="Удалить роль?"
        description="Роль будет снята с кандидатов, которым она была назначена."
        confirmLabel="Удалить"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={() =>
          pendingDeleteId !== null ? void handleDelete(pendingDeleteId) : undefined
        }
      />
    </div>
  );
}
