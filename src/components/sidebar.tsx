"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Wand2, Inbox, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profiles", label: "Niches & Profiles", icon: Users },
  { href: "/create", label: "AI Content Studio", icon: Wand2 },
  { href: "/queue", label: "Approval Queue", icon: Inbox },
  { href: "/analytics", label: "Analytics", icon: BarChart3 }
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-[#26262b] bg-[#0e0e10] p-4 gap-2 min-h-screen sticky top-0 h-screen">
      <div className="px-2 py-4">
        <p className="text-lg font-bold tracking-tight">SMCH Engine</p>
        <p className="text-xs text-zinc-500">Niche Brand + Social Handler</p>
      </div>
      {links.map((l) => {
        const active = pathname === l.href;
        const Icon = l.icon;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm",
              active ? "bg-white text-black font-semibold" : "text-zinc-300 hover:bg-white/5"
            )}
          >
            <Icon size={18} />
            {l.label}
          </Link>
        );
      })}
      <div className="mt-auto card text-xs text-zinc-400">
        <p className="font-semibold text-zinc-200 mb-1">Setup checklist</p>
        <ol className="list-decimal ml-4 space-y-1">
          <li>Add Supabase + OpenAI keys to .env.local</li>
          <li>Run supabase/schema.sql in Supabase</li>
          <li>Add Ayrshare API key</li>
        </ol>
      </div>
    </aside>
  );
}
