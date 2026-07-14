import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { PageContainer } from "@/components/page-shell";
import { Skeleton } from "@/components/ui/skeleton";

function AuthFormFallback() {
  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <PageContainer
      size="narrow"
      className="flex flex-1 items-center justify-center py-12"
    >
      <Suspense fallback={<AuthFormFallback />}>
        <AuthForm mode="login" />
      </Suspense>
    </PageContainer>
  );
}
