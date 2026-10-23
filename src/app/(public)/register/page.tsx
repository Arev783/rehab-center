import Link from "next/link";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Ստեղծել հաշիվ</h1>
          <p className="text-sm text-muted-foreground">
            Գրանցվեք՝ որպեսզի հետագայում հետևեք ձեր վերականգնմանը
          </p>
        </div>

        <RegisterForm />

        <p className="text-center text-sm text-muted-foreground">
          Արդեն ունե՞ք հաշիվ{" "}
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Մուտք
          </Link>
        </p>
      </div>
    </main>
  );
}