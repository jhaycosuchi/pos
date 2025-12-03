'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PAGES } from '@/lib/config';

interface MenuItem {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
  imagen_local?: string;
  descripcion?: string;
}

export default function MesaPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir a la página principal de atiendemesero
    // que ya tiene la funcionalidad de seleccionar mesa
    router.push(PAGES.ATIENDEMESERO);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Redirigiendo...</p>
      </div>
    </div>
  );
}