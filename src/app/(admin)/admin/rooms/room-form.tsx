"use client";

import { useActionState, useEffect, useRef } from "react";
import { createRoom } from "@/actions/rooms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RoomForm() {
  const [state, formAction, pending] = useActionState(createRoom, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="space-y-2">
        <Label htmlFor="name">Անուն</Label>
        <Input id="name" name="name" placeholder="Սենյակ 103" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="capacity">Տարողություն</Label>
        <Input id="capacity" name="capacity" type="number" defaultValue={1} min={1} max={20} className="w-28" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Ավելացվում է..." : "Ավելացնել"}
      </Button>
      {state?.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}