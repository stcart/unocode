"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

export function HomeHeroActions() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-36" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-wrap gap-3">
        <Link href="/cabinet" className={cn(buttonVariants({ size: "lg" }))}>
          Личный кабинет
          <ArrowRight data-icon="inline-end" />
        </Link>
        {user.role === "ADMIN" && (
          <Link
            href="/admin/cohorts"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            Админ-панель
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Link href="/login" className={cn(buttonVariants({ size: "lg" }))}>
        Войти в систему
        <ArrowRight data-icon="inline-end" />
      </Link>
      <Link
        href="/register"
        className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
      >
        Регистрация
      </Link>
    </div>
  );
}
