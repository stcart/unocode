import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-muted-foreground">
          Сервис «Практика» — заявки, документы и задачи в одном месте.
        </p>
        <Separator className="sm:hidden" />
        <p className="text-muted-foreground flex items-center gap-2 text-xs">
          <Link
            href="https://unocode.ru/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            UnoCode
          </Link>
          <span aria-hidden>·</span>
          <span>ИРИТ-РТФ · {new Date().getFullYear()}</span>
        </p>
      </div>
    </footer>
  )
}
