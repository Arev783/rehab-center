import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { toggleRoom } from "@/actions/rooms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RoomForm } from "./room-form";

export default async function RoomsPage() {
  await requireRole("ADMIN");
  const rooms = await prisma.room.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-8">
      <h1 className="text-2xl font-semibold">Սենյակներ</h1>

      <RoomForm />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Անուն</TableHead>
            <TableHead>Տարողություն</TableHead>
            <TableHead>Կարգավիճակ</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.name}</TableCell>
              <TableCell>{r.capacity}</TableCell>
              <TableCell>
                <Badge variant={r.isActive ? "default" : "secondary"}>
                  {r.isActive ? "Ակտիվ" : "Անջատված"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/rooms/${r.id}`}
                    className="rounded-lg border px-3 py-1 text-sm hover:bg-muted"
                  >
                    Խմբագրել
                  </Link>
                  <form action={toggleRoom}>
                    <input type="hidden" name="id" value={r.id} />
                    <Button type="submit" variant="outline" size="sm">
                      {r.isActive ? "Անջատել" : "Միացնել"}
                    </Button>
                  </form>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  );
}