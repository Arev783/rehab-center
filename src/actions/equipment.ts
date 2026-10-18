"use server"
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import type { FormState } from "./rooms";

const equipmentSchema = z.object({
    name:z.string().trim().min(2,"Անունը շատ կարճ է").max(80,"Անունը շատ երկար է"),
    description:z.string().trim().max(200, "Նկարագրությունը շատ երկար է").optional(),
})

export async function createEquipment(_prev:FormState,formData:FormData):Promise<FormState>{

    const admin = await requireRole("ADMIN");

    const parsed = equipmentSchema.safeParse({
        name:formData.get("name"),
        description:formData.get("description") || undefined
    })

    if(!parsed.success){
        return {error:parsed.error.issues[0].message};
    }

    try{
        const item = await prisma.equipment.create({data:parsed.data});

        await prisma.auditLog.create({
            data:{userId:admin.id,action:"CREATE",entity:"Equipment", entityId: item.id }
        })
    }catch(e){
        if((e as { code?: string }).code === "P2002")
            return {error:"Այդ անունով սարքավորում արդեն կա"}
        throw e;
    }
    revalidatePath('/admin/equipment');
    return { ok: true };
}

export async function toggleEquipment(formData:FormData){
    const admin = await requireRole("ADMIN");
    const id = String(formData.get("id"));
    
    const equipment = await prisma.equipment.findUnique({where:{id}});
    if(!equipment) return;

    await prisma.equipment.update({where:{id},data:{isActive: !equipment.isActive}});
    await prisma.auditLog.create({
        data:{
        userId: admin.id,
        action: equipment.isActive ? "DEACTIVATE" : "ACTIVATE",
        entity: "Equipment",
        entityId:id
        },
    });
     revalidatePath('/admin/equipment');
     
}