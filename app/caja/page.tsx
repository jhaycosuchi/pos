'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CajaRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/caja');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-white">Redirigiendo a Caja...</p>
      </div>
    </div>
  );
}
