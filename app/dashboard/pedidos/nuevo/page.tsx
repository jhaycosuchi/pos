export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PedidoForm from './form';

export default function NuevoPedidoPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/pedidos"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Pedido</h1>
          <p className="text-gray-600 mt-1">Registra un nuevo pedido en el sistema</p>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-4xl">
        <PedidoForm />
      </div>
    </div>
  );
}
