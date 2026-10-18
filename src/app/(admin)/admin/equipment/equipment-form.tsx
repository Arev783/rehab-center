"use client"
import { useActionState, useEffect, useRef } from "react";
import { createEquipment } from "@/actions/equipment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EquipmentForm () {
const [state,formAction,pending] = useActionState(createEquipment,undefined);
const formRef = useRef<HTMLFormElement>(null);

useEffect(()=>{
    if(state?.ok)formRef.current?.reset();
},[state]);

return(
      <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="space-y-2">
        <Label htmlFor="name">Անուն</Label>
        <Input id="name" name="name" placeholder="Սարքավորում 103" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor=	"description">Նկարագրություն</Label>
        <Input id="description" name="description" className="w-28" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Ավելացվում է..." : "Ավելացնել"}
      </Button>
      {state?.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
);
}