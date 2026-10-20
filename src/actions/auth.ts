"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { HOME_BY_ROLE, createSession, deleteSession } from "@/lib/session";
import { z } from "zod";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";

const loginSchema = z.object({
  email:z.string().trim().toLowerCase().email("Սխալ email"),
  password:z.string().min(1,"Գաղտնաբառը պարտադիր է")
})

export async function login(_prev: string | undefined, formData: FormData) {

  const ip = (await headers()).get("x-forwarded-for") ?? "unknown";
const limit = rateLimit(`login:${ip}`);
if(!limit.ok) return `Չափազանց շատ փորձեր։ Փորձիր ${limit.retryAfter} վրկ հետո։`;

const parsed = loginSchema.safeParse({
  email:formData.get("email"),
  password:formData.get("password")
})

if(!parsed.success){return parsed.error.issues[0].message;}

const {email,password} = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  const ok =
    !!user && user.isActive && (await bcrypt.compare(password, user.passwordHash));

  if (!user || !ok) return "Սխալ email կամ գաղտնաբառ";

  await createSession({ id: user.id, name: user.name, role: user.role });
  await prisma.auditLog.create({
    data: { userId: user.id, action: "LOGIN", entity: "User", entityId: user.id },
  });
  redirect(HOME_BY_ROLE[user.role]);
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}


const registerSchema = z.object({
  name:z.string().trim().min(2,"Անունը շատ կարճ է").max(80,"Անունը շատ երկար է"),
  email:z.string().trim().toLowerCase().email("Սխալ email"),
  password:z.string().min(8,"Գաղտնաբառը առնվազն 8 նիշ է").max(72,"Գաղտնաբառը շատ երկար է"),
  consentAi:z.boolean()
});

export async function register(_prev:string | undefined,formData:FormData){

  const ip = (await headers()).get("x-forwarded-for") ?? "unknown";
const limit = rateLimit(`register:${ip}`);
if(!limit.ok) return `Չափազանց շատ փորձեր։ Փորձիր ${limit.retryAfter} վրկ հետո։`;

const parsed = registerSchema.safeParse({
  name:formData.get("name"),
  email:formData.get("email"),
  password:formData.get("password"),
  consentAi:formData.get("consentAi") === 'on',
})

if(!parsed.success){
  return parsed.error.issues[0].message;
}

const {name,email,password,consentAi} = parsed.data;

const passwordHash = await bcrypt.hash(password,10);

let user;
try{
  user = await prisma.user.create({
    data:{
  name,
  email,
  passwordHash,
  role:"PATIENT",
  patientProfile:{
    create:{consentAi,consentAt:consentAi ? new Date() : null},
  },
    }
  })
}catch(e){
  if ((e as { code?: string }).code === "P2002") {
      return "Այդ email-ով հաշիվ արդեն կա";
}
throw e;
}

await prisma.auditLog.create({
  data:{
    userId:user.id,action:"REGISTER",entity:"User",entityId:user.id
  },
})
await createSession({id:user.id,name:user.name,role:user.role});
redirect(HOME_BY_ROLE[user.role]);
}