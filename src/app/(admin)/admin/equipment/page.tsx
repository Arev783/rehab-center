import {prisma} from "@/lib/prisma"
import {requireRole} from "@/lib/session"
import { toggleEquipment } from "@/actions/equipment"
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
import {EquipmentForm } from "./equipment-form";

export default async function EquipmentPage(){
    await requireRole("ADMIN");
    const items = await prisma.equipment.findMany({orderBy:{ name:"asc" } });
    return(
<main className="mx-auto max-w-3xl space-y-6 p-8">
      <h1 className="text-2xl font-semibold">Սարքավորումներ</h1>

      <EquipmentForm />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Անուն</TableHead>
            <TableHead>Նկարագրություն</TableHead>
            <TableHead>Կարգավիճակ</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((it) => (
            <TableRow key={it.id}>
              <TableCell>{it.name}</TableCell>
              <TableCell>{it.description ?? "—"}</TableCell>
              <TableCell>
                <Badge variant={it.isActive ? "default" : "secondary"}>
                  {it.isActive ? "Ակտիվ" : "Անջատված"}
                </Badge>
              </TableCell>
              <TableCell>
                <form action={toggleEquipment}>
                  <input type="hidden" name="id" value={it.id} />
                  <Button type="submit" variant="outline" size="sm">
                    {it.isActive ? "Անջատել" : "Միացնել"}
                  </Button>
                </form>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
    )
}