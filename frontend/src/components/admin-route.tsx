"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
      return;
    }

    if (!isLoading && user && user.role !== "ADMIN") {
      router.replace("/profile");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-10">
        <p className="text-muted-foreground text-sm">Загрузка...</p>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return children;
}
