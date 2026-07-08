import type { Application } from "@/lib/types/application";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type TasksTabProps = {
  applications: Application[];
};

export function TasksTab({ applications }: TasksTabProps) {
  const approvedApplications = applications.filter(
    (application) => application.status === "APPROVED"
  );

  if (approvedApplications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Задачи недоступны</CardTitle>
          <CardDescription>
            Раздел задач откроется после одобрения заявки в когорте.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Сейчас у вас нет одобренных заявок. После одобрения здесь появится
            сетка задач по неделям практики.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Задачи и прогресс</CardTitle>
          <CardDescription>
            Каркас раздела готов — наполнение на Этапе 7.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-sm">
            У вас есть одобренные заявки в когортах:
          </p>
          <ul className="space-y-2">
            {approvedApplications.map((application) => (
              <li
                key={application.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <span className="font-medium">{application.cohort.name}</span>
                <Badge variant="default">Одобрена</Badge>
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground text-sm">
            Сетка задач по рабочим дням и карточки прогресса будут добавлены на
            следующем этапе.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
