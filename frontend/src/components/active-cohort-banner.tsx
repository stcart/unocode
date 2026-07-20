"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarRange } from "lucide-react";
import { fetchActiveCohort } from "@/lib/api/applications";
import type { ActiveCohort } from "@/lib/types/application";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ActiveCohortBanner() {
  const [cohort, setCohort] = useState<ActiveCohort | null | undefined>(
    undefined
  );

  useEffect(() => {
    void fetchActiveCohort()
      .then((data) => setCohort(data.cohort))
      .catch(() => setCohort(null));
  }, []);

  if (cohort === undefined) {
    return <Skeleton className="h-24 w-full rounded-lg" />;
  }

  if (!cohort) {
    return null;
  }

  return (
    <Alert className="border-primary/20 bg-primary/5">
      <CalendarRange />
      <AlertTitle>Открыт приём заявок: {cohort.name}</AlertTitle>
      <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Подайте анкету до {cohort.applicationEnd}. Практика:{" "}
          {cohort.practiceStart} — {cohort.practiceEnd}.
        </span>
        <Link
          href={`/apply/${cohort.id}`}
          className={cn(buttonVariants({ size: "sm" }), "shrink-0")}
        >
          Подать заявку
          <ArrowRight data-icon="inline-end" />
        </Link>
      </AlertDescription>
    </Alert>
  );
}
