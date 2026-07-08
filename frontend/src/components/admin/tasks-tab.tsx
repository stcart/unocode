import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AdminTasksTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Задачи и прогресс</CardTitle>
        <CardDescription>
          Сетка задач по неделям будет реализована на Этапе 8.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Здесь админ увидит карточки задач всех практикантов когорты — без
          переключателя «Показать всех», как в личном кабинете студента.
        </p>
      </CardContent>
    </Card>
  );
}
