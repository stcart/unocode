"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, Shield } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

export function AuthNav() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="ml-auto flex items-center gap-2">
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-7 w-20" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        {user.role === "ADMIN" && (
          <Link
            href="/admin/cohorts"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              pathname.startsWith("/admin") && "bg-muted text-foreground"
            )}
          >
            <Shield data-icon="inline-start" />
            Админ
          </Link>
        )}
        <Link
          href="/cabinet"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            pathname.startsWith("/cabinet") && "bg-muted text-foreground"
          )}
        >
          <LayoutDashboard data-icon="inline-start" />
          Кабинет
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            logout();
            router.push("/");
          }}
        >
          <LogOut data-icon="inline-start" />
          Выйти
        </Button>
      </div>
    );
  }

  return (
    <div className="ml-auto flex items-center gap-2">
      <Link
        href="/login"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
      >
        Вход
      </Link>
      <Link href="/register" className={cn(buttonVariants({ size: "sm" }))}>
        Регистрация
      </Link>
    </div>
  );
}
