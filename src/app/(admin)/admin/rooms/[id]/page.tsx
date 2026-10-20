import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { EditRoomForm } from "./edit-room-form";

export default async function EditroomPage({
    params,
}:{params:Promise<{id:string}>}){
   await requireRole("ADMIN");
   const {id} = await params;

   const room = await prisma.room.findUnique({where:{id}});
   if(!room) notFound();
   return(
  <main className="mx-auto max-w-md space-y-6 p-8">
      <Link href="/admin/rooms" className="text-sm underline">
        ← Հետ
      </Link>
      <h1 className="text-2xl font-semibold">Սենյակի խմբագրում</h1>
      <EditRoomForm
        room={{ id: room.id, name: room.name, capacity: room.capacity }}
      />
    </main>
   )
}