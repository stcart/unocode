"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { ApplicationsTab } from "@/components/cabinet/applications-tab";
import { DocumentsTab } from "@/components/cabinet/documents-tab";
import { TasksTab } from "@/components/cabinet/tasks-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiError } from "@/lib/api";
import { fetchMyApplications } from "@/lib/api/applications";
import type { Application } from "@/lib/types/application";
import { useAuth } from "@/providers/auth-provider";

function CabinetContent() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadApplications() {
      try {
        const data = await fetchMyApplications();
        setApplications(data.applications);
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : "Не удалось загрузить заявки"
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadApplications();
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          Личный кабинет
        </h1>
        <p className="text-muted-foreground text-sm">{user.email}</p>
      </div>

      <Tabs defaultValue="applications">
        <TabsList>
          <TabsTrigger value="applications">Заявки</TabsTrigger>
          <TabsTrigger value="documents">Документы</TabsTrigger>
          <TabsTrigger value="tasks">Задачи</TabsTrigger>
        </TabsList>

        <TabsContent value="applications">
          <ApplicationsTab
            applications={applications}
            isLoading={isLoading}
            error={error}
          />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentsTab applications={applications} />
        </TabsContent>

        <TabsContent value="tasks">
          <TasksTab applications={applications} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function CabinetPage() {
  return (
    <ProtectedRoute>
      <CabinetContent />
    </ProtectedRoute>
  );
}
