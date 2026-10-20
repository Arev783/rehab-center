import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import {
  DoorOpen,
  Wrench,
  Users,
  Calendar,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const admin = await requireRole("ADMIN");

  // ✅ Զուգահեռ հարցումներ (Promise.all) — արագ է
  const [rooms, equipment, users, appointments] = await Promise.all([
    prisma.room.count({ where: { isActive: true } }),
    prisma.equipment.count({ where: { isActive: true } }),
    prisma.user.count(),
    prisma.appointment.count({ where: { status: "SCHEDULED" } }),
  ]);

  const stats = [
    {
      label: "Ակտիվ սենյակներ",
      value: rooms,
      icon: DoorOpen,
      href: "/admin/rooms",
      color: "text-sky-700 bg-sky-50",
    },
    {
      label: "Սարքավորումներ",
      value: equipment,
      icon: Wrench,
      href: "/admin/equipment",
      color: "text-emerald-700 bg-emerald-50",
    },
    {
      label: "Օգտատերեր",
      value: users,
      icon: Users,
      href: "/admin/users",
      color: "text-sky-700 bg-sky-50",
    },
    {
      label: "Պլանավորված այցեր",
      value: appointments,
      icon: Calendar,
      href: "#",
      color: "text-emerald-700 bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e7490] via-[#087f8c] to-[#15803d] px-7 py-8 text-white shadow-xl shadow-emerald-900/10 md:px-10 md:py-10">
        <div className="absolute -right-12 -top-24 size-72 rounded-full border border-white/10 bg-white/[0.04]" />
        <div className="absolute -bottom-36 right-24 size-72 rounded-full border border-white/10 bg-white/[0.04]" />
        <div className="relative">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100/80">Վերականգնողական կենտրոն</p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Բարի գալուստ, {admin.name}</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">
            Ահա՛ համակարգի ամփոփ վիճակը։
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/[0.07]"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 to-emerald-500 opacity-70 transition-opacity group-hover:opacity-100" />
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </p>
                  <p className="pt-2 text-4xl font-semibold tracking-tight text-slate-800">{stat.value}</p>
                </div>
                <div
                  className={`rounded-2xl p-3 ${stat.color} transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon size={24} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.03] md:p-7">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Արագ մուտք</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-800">Արագ գործողություններ</h2>
          </div>
          <div className="hidden size-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700 sm:flex">
            <ArrowRight size={18} />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <QuickAction
            href="/admin/rooms"
            icon={<DoorOpen size={20} />}
            title="Սենյակներ"
            description="Կառավարիր սենյակները"
          />
          <QuickAction
            href="/admin/equipment"
            icon={<Wrench size={20} />}
            title="Սարքավորումներ"
            description="Կառավարիր սարքավորումները"
          />
          <QuickAction
            href="/admin/users"
            icon={<Users size={20} />}
            title="Օգտատերեր"
            description="Կառավարիր օգտատերերին"
          />
        </div>
      </div>

      {/* Info card */}
      <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-sky-50 p-6 md:p-7">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-sky-600 p-3 text-white shadow-lg shadow-emerald-900/15">
            <TrendingUp size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-800">Համակարգը աշխատում է</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
              Բոլոր հիմնական մոդուլները պատրաստ են։ Սկսիր կառավարել
              սենյակները և սարքավորումները։
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-50/50 hover:shadow-md hover:shadow-emerald-900/[0.04]"
    >
      <div className="rounded-xl bg-gradient-to-br from-sky-100 to-emerald-100 p-2.5 text-emerald-800 transition-all group-hover:from-sky-600 group-hover:to-emerald-600 group-hover:text-white">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-slate-800">{title}</p>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
      <ArrowRight
        size={16}
        className="text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-emerald-700"
      />
    </Link>
  );
}