import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type Role = "PATIENT" | "THERAPIST" | "ADMIN";
export type SessionUser = {
  id:string,
  name:string,
  role:Role;
}
function isRole(value:unknown):value is Role{
return(
  value === "PATIENT" ||
  value === "THERAPIST" || 
  value === "ADMIN"
)
}
const secret = process.env.AUTH_SECRET;
if(!secret) throw new Error("AUTH_SECRET is not set in .env.local");
const key = new TextEncoder().encode(secret);
export const HOME_BY_ROLE:Record<Role,string> ={
  PATIENT:"/patient/dashboard",
  THERAPIST:"/therapist/dashboard",
  ADMIN:'/admin/dashboard',
}

export async function createSession(user:SessionUser) {

  const token = await new SignJWT({...user})
  .setProtectedHeader({alg:"HS256"})
  .setExpirationTime('7d')
  .sign(key);

  (await cookies()).set('session',token,{
    httpOnly:true,
    sameSite:'lax',
    secure:process.env.NODE_ENV ==="production",
    path:'/',
    maxAge:60*60*24*7,
  });
}

export async function deleteSession(){
(await cookies()).delete("session")
}

export async function getSession():Promise<SessionUser | null> {
  
  const token = (await cookies()).get("session")?.value;
  if(!token){
    return null;
  }
  try{

    const {payload} = await jwtVerify(token,key);
    if(!isRole(payload.role)){
      return null;
    }
    return {
      id:payload.id as string,
      name:payload.name as string,
      role:payload.role 
    };

  }catch{
    return null
  }
}

export async function  requireRole(role:Role){
  const user = await getSession();
  if(!user){
     redirect("/login");
  }
  if(user.role !== role) {
   redirect(HOME_BY_ROLE[user.role]);
  }

  return user;
}