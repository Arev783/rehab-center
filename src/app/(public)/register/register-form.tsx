"use client"

import { useActionState } from "react";
import { register } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm(){
    const [error,formAction,pending] = useActionState(register,undefined);
    return(
        <form action={formAction}>
             <div className="space-y-2">
        <Label htmlFor="name">Անուն Ազգանուն</Label>
        <Input id="name" name="name" required minLength={2} maxLength={80} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Գաղտնաբառ</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          maxLength={72}
        />
        <p className="text-xs text-muted-foreground">Առնվազն 8 նիշ</p>
      </div>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="consentAi" className="mt-1" />
        <span>
          Համաձայն եմ, որ իմ վերականգնողական տվյալները վերլուծվեն AI
          օգնականի կողմից (կարող ես չնշել)
        </span>
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Գրանցում..." : "Գրանցվել"}
      </Button>
        </form>
    )
}