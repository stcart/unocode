"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
export function AuthNav() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return null;
  }

  if (user) {
    return (
      <div className="ml-auto flex items-center gap-3">
        <Link
          href="/profile"
          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
        >
          {user.email}
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            logout();
            router.push("/");
          }}
        >
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
      <Link
        href="/register"
        className={cn(buttonVariants({ size: "sm" }))}
      >
        Регистрация
      </Link>
    </div>
  );}
