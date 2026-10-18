"use client";

import { useActionState } from "react";
import { login } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [error, formAction, pending] = useActionState(login, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Գաղտնաբառ</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Մուտք..." : "Մուտք"}
      </Button>
    </form>
  );
}