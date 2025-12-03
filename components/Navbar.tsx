'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { User } from '../lib/auth';
import { PAGES, IMAGES } from '@/lib/config';

interface NavbarProps {
  user: User;
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();

  const handleLogout = () => {
    // Limpiar el token de las cookies
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    // Redirigir al login
    router.push(PAGES.LOGIN);
  };

  return (
    <header className="bg-primary text-white p-4 shadow-lg border-b-4 border-secondary">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Image
              src={IMAGES.LOGO}
              alt="Logo POS System"
              width={60}
              height={60}
              className="rounded-xl shadow-lg border-2 border-white/20"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-white"></div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-wide">POS - Sistema de Ventas</h1>
            <p className="text-sm text-blue-200 font-medium">Sistema de punto de venta profesional</p>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <span className="text-sm font-medium">Bienvenido, {user.nombre}</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className="bg-secondary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-md">
                {user.rol}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-error hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
}