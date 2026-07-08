import { HealthCheck } from "@/components/health-check";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Сервис «Практика»
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
          Веб-сервис для организации приёма студентов на практику, ведения
          заявок, документооборота и контроля задач. Этап 3: админ может{" "}
          <a
            href="/admin/cohorts"
            className="text-foreground underline-offset-4 hover:underline"
          >
            управлять когортами
          </a>
          , анкетами, ролями и тестовыми заданиями.
        </p>
      </section>

      <HealthCheck />
    </div>
  );
}
