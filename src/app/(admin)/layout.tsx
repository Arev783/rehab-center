import Link from "next/link";
import { requireRole } from "@/lib/session";
import { Home, DoorOpen, Wrench, Users, LogOut } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("ADMIN");

  return (
    <div className="min-h-screen bg-[#f5f8fa] text-slate-900 md:flex">
      {/* Sidebar */}
      <aside className="border-b border-white/10 bg-[#102f35] p-4 text-white md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col md:border-b-0 md:border-r md:p-5">
        <div className="mb-5 flex items-center gap-3 md:mb-10">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-emerald-300 text-[#102f35] shadow-lg shadow-emerald-950/20">
            <Home size={20} />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide">Rehab Admin</h2>
            <p className="mt-0.5 text-[11px] text-emerald-100/55">Կառավարման վահանակ</p>
          </div>
        </div>
        <p className="mb-3 hidden px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-100/45 md:block">
          Բաժիններ
        </p>
        <nav className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 md:grid-cols-1 md:gap-1">
          <NavLink href="/admin/dashboard" icon={<Home size={18} />}>
            Dashboard
          </NavLink>
          <NavLink href="/admin/rooms" icon={<DoorOpen size={18} />}>
            Սենյակներ
          </NavLink>
          <NavLink href="/admin/equipment" icon={<Wrench size={18} />}>
            Սարքավորումներ
          </NavLink>
          <NavLink href="/admin/users" icon={<Users size={18} />}>
            Օգտատերեր
          </NavLink>
        </nav>
      </aside>

      {/* Main */}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/85 px-5 py-4 backdrop-blur-xl md:px-9">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">Վարչական տարածք</p>
              <h1 className="mt-0.5 text-sm font-semibold text-slate-800">Admin Panel</h1>
            </div>
            <form action="/api/logout" method="post">
              <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600">
                <LogOut size={16} /> Ելք
              </button>
            </form>
          </div>
        </header>
        <main className="p-5 md:px-9 md:py-8">{children}</main>
      </div>
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium text-emerald-50/65 transition duration-200 hover:bg-white/[0.08] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 sm:text-sm"
    >
      <span className="text-sky-100/60 transition group-hover:text-emerald-200">{icon}</span>
      {children}
    </Link>
  );
}