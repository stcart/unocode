import Link from "next/link"
import { GraduationCap } from "lucide-react"
import { AuthNav } from "@/components/auth-nav"
import { Separator } from "@/components/ui/separator"

export function SiteHeader() {
  return (
    <header className="bg-background/90 sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="hover:text-primary flex items-center gap-2.5 transition-colors"
        >
          <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
            <GraduationCap className="size-4" />
          </span>
          <span className="font-heading text-base font-semibold tracking-tight">
            Практика UnoCode
          </span>
        </Link>

        <Separator orientation="vertical" className="hidden h-5 sm:block" />

        <p className="text-muted-foreground hidden text-xs tracking-wide sm:block">
          Сопровождение производственной практики
        </p>

        <AuthNav />
      </div>
    </header>
  )
}
