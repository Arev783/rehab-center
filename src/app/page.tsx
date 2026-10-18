import { redirect } from "next/navigation";
import { getSession, HOME_BY_ROLE } from "@/lib/session";

export default async function Home() {
  const user = await getSession();
  redirect(user ? HOME_BY_ROLE[user.role] : "/login");
}