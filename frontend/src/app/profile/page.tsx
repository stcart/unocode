"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/providers/auth-provider";

function ProfileContent() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Личный кабинет</CardTitle>
        <CardDescription>
          Защищённая страница — доступна только после входа. Данные получены
          через <code className="text-sm">GET /auth/me</code>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-muted-foreground text-sm">Email</p>
          <p className="font-medium">{user.email}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">Роль</p>
          <Badge variant="secondary">{user.role}</Badge>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">ID пользователя</p>
          <p className="font-medium">{user.id}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-10">
        <ProfileContent />
      </div>
    </ProtectedRoute>
  );
}
