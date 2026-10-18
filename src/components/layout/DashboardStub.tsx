import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { requireRole, type Role } from "@/lib/session";

export async function DashboardStub({ title, role }: { title: string; role: Role }) {
  const user = await requireRole(role);

  return (
    <main className="space-y-4 p-8">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p>Բարև, {user.name} ({user.role})</p>
      <form action={logout}>
        <Button type="submit" variant="outline">Ելք</Button>
      </form>
    </main>
  );
}