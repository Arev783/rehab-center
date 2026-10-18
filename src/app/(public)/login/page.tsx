import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-center text-2xl font-semibold">
          Վերականգնողական կենտրոն
        </h1>
        <LoginForm />
        <p className="text-center text-xs text-muted-foreground">
          Դեմո՝ patient1@rehab.test / Password123!
        </p>
      </div>
    </main>
  );
}