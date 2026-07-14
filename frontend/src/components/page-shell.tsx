import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

type PageContainerProps = {
  children: React.ReactNode
  className?: string
  size?: "default" | "narrow"
}

export function PageContainer({
  children,
  className,
  size = "default",
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10",
        size === "narrow" ? "max-w-3xl" : "max-w-5xl",
        className
      )}
    >
      {children}
    </div>
  )
}

type PageHeaderProps = {
  title: string
  description?: React.ReactNode
  eyebrow?: string
  backHref?: string
  backLabel?: string
  actions?: React.ReactNode
}

export function PageHeader({
  title,
  description,
  eyebrow,
  backHref,
  backLabel = "Назад",
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        {backHref && (
          <Link
            href={backHref}
            className="text-muted-foreground hover:text-foreground inline-flex items-center text-sm transition-colors"
          >
            ← {backLabel}
          </Link>
        )}
        {eyebrow && (
          <p className="text-muted-foreground text-xs font-medium tracking-[0.12em] uppercase">
            {eyebrow}
          </p>
        )}
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

type EmptyStateProps = {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 py-12 text-center">
      {Icon && (
        <div className="bg-background text-muted-foreground mb-4 flex size-10 items-center justify-center rounded-lg border">
          <Icon className="size-5" />
        </div>
      )}
      <p className="font-medium">{title}</p>
      {description && (
        <p className="text-muted-foreground mt-1 max-w-sm text-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function PageLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96 max-w-full" />
      <Skeleton className="mt-6 h-48 w-full" />
    </div>
  )
}
