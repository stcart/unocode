import Link from "next/link";
import {
  ClipboardList,
  FileText,
  LayoutGrid,
  ArrowRight,
} from "lucide-react";
import { PageContainer } from "@/components/page-shell";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: ClipboardList,
    title: "Заявки",
    description:
      "Публичная анкета, тестовое задание и статус рассмотрения в одном потоке.",
  },
  {
    icon: FileText,
    title: "Документы",
    description:
      "Индивидуальное задание, отзыв и титульный лист формируются автоматически.",
  },
  {
    icon: LayoutGrid,
    title: "Задачи",
    description:
      "Недельная сетка практики с фиксацией прогресса и комментариев.",
  },
] as const;

export default function Home() {
  return (
    <PageContainer className="gap-12">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div className="space-y-5">
          <p className="text-muted-foreground text-xs font-medium tracking-[0.14em] uppercase">
            ИРИТ-РТФ
          </p>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Организация и сопровождение практики
            </h1>
            <p className="text-muted-foreground max-w-xl text-base leading-relaxed">
              Единый сервис для приёма студентов, документооборота и контроля
              выполнения задач в рамках производственной практики.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/login" className={cn(buttonVariants({ size: "lg" }))}>
              Войти в систему
              <ArrowRight data-icon="inline-end" />
            </Link>
            <Link
              href="/cabinet"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Личный кабинет
            </Link>
          </div>
        </div>

        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base">Как это работает</CardTitle>
            <CardDescription>
              Процесс выстроен по этапам — от заявки до отчёта.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex gap-3">
              <span className="text-muted-foreground w-5 shrink-0 font-mono text-xs">
                01
              </span>
              <p>Подача заявки и выполнение тестового задания</p>
            </div>
            <div className="flex gap-3">
              <span className="text-muted-foreground w-5 shrink-0 font-mono text-xs">
                02
              </span>
              <p>Заполнение данных и формирование документов</p>
            </div>
            <div className="flex gap-3">
              <span className="text-muted-foreground w-5 shrink-0 font-mono text-xs">
                03
              </span>
              <p>Отчётность и контроль задач по неделям</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {FEATURES.map((feature) => (
          <Card key={feature.title} className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="bg-muted text-foreground mb-1 flex size-9 items-center justify-center rounded-md border">
                <feature.icon className="size-4" />
              </div>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </PageContainer>
  );
}
