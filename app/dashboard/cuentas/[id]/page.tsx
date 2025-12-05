export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getDb } from '../../../../lib/db';
import {
  ChevronLeft,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  ChefHat,
  Truck,
  Users
} from 'lucide-react';

interface Pedido {
  id: number;
  numero_pedido: string;
  es_para_llevar: number;
  estado: string;
  total: number;
  creado_en: string;
  actualizado_en: string;
  items_count: number;
}

interface Cuenta {
  id: number;
  mesa_numero: string;
  mesero_nombre: string;
  estado: string;
  total: number;
  creado_en: string;
  pedido_count: number;
}

async function getCuenta(id: string): Promise<Cuenta | null> {
  const db = getDb();
  const cuenta = db.prepare(`
    SELECT
      c.id,
      c.mesa_numero,
      u.nombre as mesero_nombre,
      c.estado,
      c.total,
      c.fecha_apertura as creado_en,
      COUNT(p.id) as pedido_count
    FROM cuentas c
    LEFT JOIN usuarios u ON c.mesero_id = u.id
    LEFT JOIN pedidos p ON c.id = p.cuenta_id
    WHERE c.id = ?
    GROUP BY c.id
  `, [parseInt(id)]).get();

  return cuenta as Cuenta | null;
}

async function getPedidosDeCuenta(cuentaId: string): Promise<Pedido[]> {
  const db = getDb();
  const pedidos = db.prepare(`
    SELECT
      p.id,
      p.numero_pedido,
      p.es_para_llevar,
      p.estado,
      p.total,
      p.creado_en,
      p.actualizado_en,
      COUNT(dp.id) as items_count
    FROM pedidos p
    LEFT JOIN detalle_pedidos dp ON p.id = dp.pedido_id
    WHERE p.cuenta_id = ?
    GROUP BY p.id
    ORDER BY p.creado_en DESC
  `, [parseInt(cuentaId)]).all();

  return pedidos as Pedido[];
}

function getEstadoColor(estado: string) {
  switch (estado?.toUpperCase()) {
    case 'PENDIENTE': return 'bg-yellow-100 text-yellow-800';
    case 'PREPARANDO': return 'bg-blue-100 text-blue-800';
    case 'LISTO': return 'bg-green-100 text-green-800';
    case 'ENTREGADO': return 'bg-gray-100 text-gray-800';
    case 'CANCELADO': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getCuentaEstadoColor(estado: string) {
  switch (estado?.toUpperCase()) {
    case 'ABIERTA': return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'CERRADA': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'COBRADA': return 'text-green-600 bg-green-50 border-green-200';
    case 'CANCELADA': return 'text-red-600 bg-red-50 border-red-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

function getEstadoIcon(estado: string) {
  switch (estado?.toUpperCase()) {
    case 'PENDIENTE': return <Clock className="w-4 h-4" />;
    case 'PREPARANDO': return <ChefHat className="w-4 h-4" />;
    case 'LISTO': return <CheckCircle className="w-4 h-4" />;
    case 'ENTREGADO': return <Truck className="w-4 h-4" />;
    case 'CANCELADO': return <XCircle className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
}

export default async function CuentaDetailPage({ params }: { params: { id: string } }) {
  const cuenta = await getCuenta(params.id);
  const pedidos = cuenta ? await getPedidosDeCuenta(params.id) : [];

  if (!cuenta) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard/cuentas"
            className="text-blue-600 hover:text-blue-900"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Cuenta no encontrada</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard/cuentas"
          className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50"
          title="Volver"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {cuenta.mesa_numero || `Cuenta ${cuenta.id}`}
          </h1>
          <p className="text-gray-600 mt-1">Detalles y pedidos asociados</p>
        </div>
      </div>

      {/* Info de la cuenta */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cuenta</p>
              <p className="text-3xl font-bold text-gray-900">${cuenta.total.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mesero</p>
              <p className="text-2xl font-bold text-gray-900">{cuenta.mesero_nombre || 'N/A'}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pedidos</p>
              <p className="text-3xl font-bold text-gray-900">{cuenta.pedido_count}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Estado</p>
              <p className={`text-xl font-bold rounded px-2 py-1 border ${getCuentaEstadoColor(cuenta.estado)}`}>
                {cuenta.estado?.toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de pedidos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Pedidos de la Cuenta</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pedidos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg mb-2">No hay pedidos</p>
                    <p className="text-sm text-gray-400">Esta cuenta no tiene pedidos asociados</p>
                  </td>
                </tr>
              ) : (
                pedidos.map((pedido) => (
                  <tr key={pedido.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{pedido.numero_pedido}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        pedido.es_para_llevar === 1 ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {pedido.es_para_llevar === 1 ? 'Para llevar' : 'En mesa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pedido.items_count} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${pedido.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(pedido.estado)}`}>
                        {getEstadoIcon(pedido.estado)}
                        {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(pedido.creado_en).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/cuentas/${cuenta.id}/pedidos/${pedido.id}`}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50 transition-colors" title="Editar">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors" title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
