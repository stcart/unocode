"use client";

import { useRouter } from "next/navigation";
import { AdminRoute } from "@/components/admin-route";
import { CohortForm } from "@/components/admin/cohort-form";
import { createCohort } from "@/lib/api/admin";

function NewCohortPageContent() {
  const router = useRouter();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Новая когорта</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          После создания вы сможете настроить анкету, роли и тестовое задание.
        </p>
      </div>

      <CohortForm
        submitLabel="Создать когорту"
        onSubmit={async (values) => {
          const { cohort } = await createCohort(values);
          router.push(`/admin/cohorts/${cohort.id}`);
        }}
      />
    </div>
  );
}

export default function NewCohortPage() {
  return (
    <AdminRoute>
      <NewCohortPageContent />
    </AdminRoute>
  );
}
