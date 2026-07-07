import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-10">
      <AuthForm mode="login" />
    </div>
  );
}
