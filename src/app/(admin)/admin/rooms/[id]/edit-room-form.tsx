"use client"
import { useActionState } from "react";
import { updateRoom } from "@/actions/rooms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EditRoomForm({
    room,
}:{
    room:{id:string,name:string,capacity:number}
}){
    const [state,formAction,pending] = useActionState(updateRoom,undefined);

    return(
         <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={room.id} />

      <div className="space-y-2">
        <Label htmlFor="name">Անուն</Label>
        <Input id="name" name="name" defaultValue={room.name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="capacity">Տարողություն</Label>
        <Input id="capacity" name="capacity" type="number" defaultValue={room.capacity} min={1} max={20} className="w-28" />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Պահպանվում է..." : "Պահպանել"}
      </Button>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-sm text-green-600">Պահպանվեց</p>}
    </form>
    )
}