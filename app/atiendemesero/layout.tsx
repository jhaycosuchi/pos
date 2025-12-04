'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PAGES } from '@/lib/config';
import { PedidoProvider } from '@/lib/context/PedidoContext';

interface Mesero {
  id: number;
  nombre: string;
  username: string;
}

export default function AtiendemeseroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mesero, setMesero] = useState<Mesero | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const meseroInfo = sessionStorage.getItem('meseroInfo');
    
    // Permite acceso a /login sin verificar sesión
    if (pathname === '/atiendemesero/login') {
      setLoading(false);
      return;
    }

    // Para otras rutas, requiere sesión
    if (!meseroInfo) {
      router.push(PAGES.MESERO_LOGIN);
      return;
    }

    setMesero(JSON.parse(meseroInfo));
    setLoading(false);
  }, [router, pathname]);

  // Muestra loading mientras se verifica sesión
  if (loading && pathname !== '/atiendemesero/login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="text-4xl">🍱</div>
          </div>
          <p className="text-white text-xl font-bold">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <PedidoProvider>
      {children}
    </PedidoProvider>
  );
}
