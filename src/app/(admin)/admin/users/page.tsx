import { requireRole } from "@/lib/session";

export default async function UsersPage() {
  await requireRole("ADMIN");

  return (
    <main className="space-y-2">
      <h1 className="text-2xl font-semibold">Օգտատերեր</h1>
      <p className="text-sm text-slate-500">Շուտով</p>
    </main>
  );
}