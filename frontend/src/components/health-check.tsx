"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { API_BASE_URL, fetchHealth, type HealthResponse } from "@/lib/api";

type HealthState =
  | { kind: "loading" }
  | { kind: "success"; data: HealthResponse }
  | { kind: "error"; message: string };

export function HealthCheck() {
  const [state, setState] = useState<HealthState>({ kind: "loading" });

  const loadHealth = useCallback(async () => {
    setState({ kind: "loading" });

    try {
      const data = await fetchHealth();
      setState({ kind: "success", data });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Не удалось связаться с API";
      setState({ kind: "error", message });
    }
  }, []);

  useEffect(() => {
    void loadHealth();
  }, [loadHealth]);

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Проверка связи с backend</CardTitle>
        <CardDescription>
          Запрос к <code className="text-sm">{API_BASE_URL}/health</code>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {state.kind === "loading" && (
          <p className="text-muted-foreground text-sm">Загрузка...</p>
        )}

        {state.kind === "error" && (
          <div className="space-y-2">
            <Badge variant="destructive">Ошибка</Badge>
            <p className="text-sm text-destructive">{state.message}</p>
          </div>
        )}

        {state.kind === "success" && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant={state.data.status === "ok" ? "default" : "secondary"}>
                API: {state.data.status}
              </Badge>
              <Badge
                variant={
                  state.data.database === "connected" ? "default" : "destructive"
                }
              >
                БД: {state.data.database}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              Время ответа: {new Date(state.data.timestamp).toLocaleString("ru-RU")}
            </p>
          </div>
        )}

        <Button variant="outline" size="sm" onClick={() => void loadHealth()}>
          Обновить
        </Button>
      </CardContent>
    </Card>
  );
}
