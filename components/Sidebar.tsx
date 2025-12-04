'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { User } from '../lib/auth';
import {
  LayoutDashboard,
  ClipboardList,
  DollarSign,
  Tag,
  ChefHat,
  Users,
  Utensils,
  BarChart3
} from 'lucide-react';

interface SidebarProps {
  user: User;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/pedidos', label: 'Pedidos', icon: ClipboardList },
    { href: '/dashboard/caja', label: 'Caja', icon: DollarSign },
    { href: '/dashboard/precios', label: 'Precios', icon: Tag },
    { href: '/dashboard/menu', label: 'Menú', icon: Utensils },
    { href: '/dashboard/meseros', label: 'Meseros', icon: ChefHat },
    { href: '/dashboard/usuarios', label: 'Usuarios', icon: Users },
    { href: '/dashboard/reportes', label: 'Reportes', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-white shadow-md min-h-screen">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-primary text-white shadow-lg transform scale-105'
                      : 'text-dark hover:bg-light hover:shadow-md'
                  }`}
                >
                  <IconComponent className={`h-5 w-5 ${isActive ? 'text-white' : 'text-primary'}`} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}