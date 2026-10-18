"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

const roomSchema = z.object({
  name: z.string().trim().min(2, "Անունը շատ կարճ է").max(50, "Անունը շատ երկար է"),
  capacity: z.coerce.number().int().min(1, "Նվազագույնը 1").max(20, "Առավելագույնը 20"),
});

export type FormState = { error?: string; ok?: boolean } | undefined;

export async function createRoom(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const admin = await requireRole("ADMIN");

  const parsed = roomSchema.safeParse({
    name: formData.get("name"),
    capacity: formData.get("capacity"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const room = await prisma.room.create({ data: parsed.data });
    await prisma.auditLog.create({
      data: { userId: admin.id, action: "CREATE", entity: "Room", entityId: room.id },
    });
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") {
      return { error: "Այդ անունով սենյակ արդեն կա" };
    }
    throw e;
  }

  revalidatePath("/admin/rooms");
  return { ok: true };
}

export async function toggleRoom(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const id = String(formData.get("id"));

  const room = await prisma.room.findUnique({ where: { id } });
  if (!room) return;

  await prisma.room.update({ where: { id }, data: { isActive: !room.isActive } });
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: room.isActive ? "DEACTIVATE" : "ACTIVATE",
      entity: "Room",
      entityId: id,
    },
  });

  revalidatePath("/admin/rooms");
}

export async function updateRoom(_prev: FormState,
  formData: FormData):Promise<FormState>{
const admin = await requireRole("ADMIN");
const id = String(formData.get("id")?? "");
if (!id) return { error: "Սենյակի id-ն բացակայում է" };
 const parsed = roomSchema.safeParse({
    name: formData.get("name"),
    capacity: formData.get("capacity"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  try{
   await prisma.room.update({where:{id},data:parsed.data});
   await prisma.auditLog.create({
    data:{userId:admin.id,action:"UPDATE",entity:"Room",entityId:id}
   })
  }catch(e){
  if ((e as { code?: string }).code === "P2002") {
      return { error: "Այդ անունով սենյակ արդեն կա" };
    }
    if ((e as { code?: string }).code === "P2025") {
      return {error:"Այդ սենյակը չի գտնվել"}
    }
    throw e;
  }
  revalidatePath("/admin/rooms");
  return {ok:true}
}