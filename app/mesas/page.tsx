'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PAGES } from '@/lib/config';

export default function MesasRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir a atiendemesero/mesas usando config centralizado
    router.push(PAGES.ATIENDEMESERO_MESAS);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-400 text-lg">Redirigiendo...</p>
      </div>
    </div>
  );
}
