"use client";

import { useRouter } from "next/navigation";
import { AdminRoute } from "@/components/admin-route";
import { CohortForm } from "@/components/admin/cohort-form";
import { PageContainer, PageHeader } from "@/components/page-shell";
import { Card, CardContent } from "@/components/ui/card";
import { createCohort } from "@/lib/api/admin";

function NewCohortPageContent() {
  const router = useRouter();

  return (
    <PageContainer size="narrow" className="gap-8">
      <PageHeader
        eyebrow="Администрирование"
        title="Новая когорта"
        description="После создания вы сможете настроить анкету, роли и тестовое задание."
        backHref="/admin/cohorts"
        backLabel="К списку когорт"
      />

      <Card className="bg-card/90 backdrop-blur-sm">
        <CardContent className="pt-6">
          <CohortForm
            submitLabel="Создать когорту"
            onSubmit={async (values) => {
              const { cohort } = await createCohort(values);
              router.push(`/admin/cohorts/${cohort.id}`);
            }}
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
}

export default function NewCohortPage() {
  return (
    <AdminRoute>
      <NewCohortPageContent />
    </AdminRoute>
  );
}
