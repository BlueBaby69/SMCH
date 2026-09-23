import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, UserCircle, PlusCircle, ListChecks, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: UserCircle, label: 'Profiles', href: '/profiles' },
    { icon: PlusCircle, label: 'Studio', href: '/create' },
    { icon: ListChecks, label: 'Queue', href: '/queue' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  ];

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
      <aside className="w-64 border-r border-zinc-800 bg-zinc-900 flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tighter text-white">SMCH Engine</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-zinc-800 text-xs text-zinc-500 text-center">
          v0.1.0 Production Ready
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
}
