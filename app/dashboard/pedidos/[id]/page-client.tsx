'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Edit, Eye } from 'lucide-react';
import Link from 'next/link';

interface Pedido {
  id: number;
  numero_pedido: string;
  es_para_llevar: number;
  estado: string;
  total: number;
  creado_en: string;
  actualizado_en: string;
  items_count: number;
  items_preview: string;
  metodo_pago?: string;
}

interface PedidosTableClientProps {
  pedidos: Pedido[];
  cuentaId: number;
}

export default function PedidosTableClient({ pedidos, cuentaId }: PedidosTableClientProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (pedidoId: number) => {
    if (!confirm('¿Estás seguro de eliminar este pedido? Esta acción no se puede deshacer.')) {
      return;
    }

    setDeletingId(pedidoId);
    try {
      const res = await fetch(`/pos/api/pedidos/${pedidoId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        alert('Pedido eliminado exitosamente');
        router.refresh();
      } else {
        alert(data.message || 'Error al eliminar el pedido');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar el pedido');
    } finally {
      setDeletingId(null);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado?.toUpperCase()) {
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'PREPARANDO':
        return 'bg-blue-100 text-blue-800';
      case 'LISTO':
        return 'bg-green-100 text-green-800';
      case 'ENTREGADO':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {pedidos.length === 0 ? (
        <tr>
          <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
            <p className="text-lg mb-2">No hay pedidos</p>
            <p className="text-sm text-gray-400">Esta cuenta no tiene pedidos asociados</p>
          </td>
        </tr>
      ) : (
        pedidos.map((pedido) => (
          <tr key={pedido.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-gray-900">#{pedido.numero_pedido}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span
                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  pedido.es_para_llevar === 1
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {pedido.es_para_llevar === 1 ? 'Para llevar' : 'En mesa'}
              </span>
            </td>
            <td className="px-6 py-4 text-sm text-gray-900">
              <div className="max-w-xs">
                <div className="font-medium text-gray-900">{pedido.items_count} items</div>
                <div className="text-xs text-gray-500 truncate" title={pedido.items_preview || ''}>
                  {pedido.items_preview || 'Sin items'}
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              ${pedido.total.toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(pedido.estado)}`}>
                {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1).toLowerCase()}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              {pedido.metodo_pago ? (
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  pedido.metodo_pago === 'efectivo' || pedido.metodo_pago === 'cash'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {pedido.metodo_pago === 'efectivo' || pedido.metodo_pago === 'cash' 
                    ? '💵 Efectivo' 
                    : pedido.metodo_pago === 'tarjeta' || pedido.metodo_pago === 'card'
                    ? '💳 Tarjeta'
                    : pedido.metodo_pago}
                </span>
              ) : (
                <span className="text-gray-400 text-sm">N/A</span>
              )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {new Date(pedido.creado_en).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/pedidos/${cuentaId}/detalle/${pedido.id}`}
                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                  title="Ver detalles"
                >
                  <Eye className="w-4 h-4" />
                </Link>
                <Link
                  href={`/dashboard/pedidos/${cuentaId}/detalle/${pedido.id}`}
                  className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50 transition-colors"
                  title="Editar pedido"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(pedido.id)}
                  disabled={deletingId === pedido.id}
                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                  title="Eliminar pedido"
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
