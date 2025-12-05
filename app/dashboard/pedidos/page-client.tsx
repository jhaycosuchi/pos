'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Edit, Eye } from 'lucide-react';
import Link from 'next/link';

interface Cuenta {
  id: number;
  mesa_numero: string;
  mesero_nombre: string;
  estado: string;
  total: number;
  creado_en: string;
  pedido_count: number;
  metodo_pago?: string;
}

interface CuentasTableClientProps {
  cuentas: Cuenta[];
}

export default function CuentasTableClient({ cuentas }: CuentasTableClientProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta cuenta? Esta acción no se puede deshacer.')) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/pos/api/cuentas/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        alert('Cuenta eliminada exitosamente');
        router.refresh();
      } else {
        alert(data.error || 'Error al eliminar la cuenta');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar la cuenta');
    } finally {
      setDeletingId(null);
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'abierta':
        return 'bg-green-100 text-green-800';
      case 'cerrada':
        return 'bg-gray-100 text-gray-800';
      case 'cobrada':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {cuentas.length === 0 ? (
        <tr>
          <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
            <p className="text-lg mb-2">No hay cuentas</p>
            <p className="text-sm text-gray-400">Las cuentas aparecerán aquí cuando se creen</p>
          </td>
        </tr>
      ) : (
        cuentas.map((cuenta) => (
          <tr key={cuenta.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-gray-900">
                #{cuenta.id}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">{cuenta.mesa_numero}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">{cuenta.mesero_nombre}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span
                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getEstadoBadge(
                  cuenta.estado
                )}`}
              >
                {cuenta.estado.charAt(0).toUpperCase() + cuenta.estado.slice(1).toLowerCase()}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {cuenta.metodo_pago ? (
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  cuenta.metodo_pago === 'efectivo' || cuenta.metodo_pago === 'cash'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {cuenta.metodo_pago === 'efectivo' || cuenta.metodo_pago === 'cash' 
                    ? '💵 Efectivo' 
                    : cuenta.metodo_pago === 'tarjeta' || cuenta.metodo_pago === 'card'
                    ? '💳 Tarjeta'
                    : cuenta.metodo_pago}
                </span>
              ) : (
                <span className="text-gray-400 text-sm">N/A</span>
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {cuenta.pedido_count}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              ${cuenta.total.toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {new Date(cuenta.creado_en).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/pedidos/${cuenta.id}`}
                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                  title="Ver detalles"
                >
                  <Eye className="w-4 h-4" />
                </Link>
                <Link
                  href={`/dashboard/pedidos/${cuenta.id}/editar`}
                  className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50 transition-colors"
                  title="Editar cuenta"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(cuenta.id)}
                  disabled={deletingId === cuenta.id}
                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                  title="Eliminar cuenta"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))
      )}
    </tbody>
  );
}
