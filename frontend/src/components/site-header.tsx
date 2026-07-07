import Link from "next/link";
import { HealthCheck } from "@/components/health-check";

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Практика
        </Link>
      </div>
    </header>
  );
}
