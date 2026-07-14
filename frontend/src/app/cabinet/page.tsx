"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { ApplicationsTab } from "@/components/cabinet/applications-tab";
import { DocumentsTab } from "@/components/cabinet/documents-tab";
import { TasksTab } from "@/components/cabinet/tasks-tab";
import {
  PageContainer,
  PageHeader,
} from "@/components/page-shell";
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
    <PageContainer className="gap-8">
      <PageHeader
        eyebrow="Личный кабинет"
        title="Рабочее пространство практиканта"
        description={user.email}
      />

      <Tabs defaultValue="applications" className="gap-6">
        <TabsList className="h-auto w-full justify-start gap-1 bg-muted/50 p-1 sm:w-auto">
          <TabsTrigger value="applications">Заявки</TabsTrigger>
          <TabsTrigger value="documents">Документы</TabsTrigger>
          <TabsTrigger value="tasks">Задачи</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="mt-0">
          <ApplicationsTab
            applications={applications}
            isLoading={isLoading}
            error={error}
          />
        </TabsContent>

        <TabsContent value="documents" className="mt-0">
          <DocumentsTab applications={applications} />
        </TabsContent>

        <TabsContent value="tasks" className="mt-0">
          <TasksTab applications={applications} />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

export default function CabinetPage() {
  return (
    <ProtectedRoute>
      <CabinetContent />
    </ProtectedRoute>
  );
}
