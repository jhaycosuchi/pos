export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getDb } from '../../../../lib/db';
import {
  ChevronLeft,
  Clock,
  CheckCircle,
  XCircle,
  ChefHat,
  Truck,
  Users
} from 'lucide-react';
import PedidosTableClient from './page-client';

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
  `).get(parseInt(id));

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
      c.metodo_pago,
      COUNT(dp.id) as items_count,
      GROUP_CONCAT(
        CASE 
          WHEN dp.cantidad > 1 THEN dp.cantidad || 'x ' || dp.producto_nombre
          ELSE dp.producto_nombre
        END, ', '
      ) as items_preview
    FROM pedidos p
    LEFT JOIN detalle_pedidos dp ON p.id = dp.pedido_id
    LEFT JOIN cuentas c ON p.cuenta_id = c.id
    WHERE p.cuenta_id = ?
    GROUP BY p.id
    ORDER BY p.creado_en DESC
  `).all(parseInt(cuentaId));

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

function getCuentaEstadoColor(estado: string) {
  switch (estado?.toUpperCase()) {
    case 'ABIERTA': return 'bg-blue-100 text-blue-800';
    case 'CERRADA': return 'bg-yellow-100 text-yellow-800';
    case 'COBRADA': return 'bg-green-100 text-green-800';
    case 'CANCELADA': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export default async function CuentaDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const cuenta = await getCuenta(params.id);
  const pedidos = await getPedidosDeCuenta(params.id);

  if (!cuenta) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <p className="text-red-800 font-medium">Cuenta no encontrada</p>
        </div>
        <Link
          href="/dashboard/pedidos"
          className="text-blue-600 hover:text-blue-900 flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a cuentas
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con volver */}
      <div>
        <Link
          href="/dashboard/pedidos"
          className="text-blue-600 hover:text-blue-900 flex items-center gap-2 mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a cuentas
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {cuenta.mesa_numero || `Cuenta ${cuenta.id}`}
        </h1>
        <p className="text-gray-600 mt-1">Detalles y pedidos asociados</p>
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
              <p className={`text-xl font-bold rounded px-2 py-1 ${getCuentaEstadoColor(cuenta.estado)}`}>
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
                  Método Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <PedidosTableClient pedidos={pedidos} cuentaId={cuenta.id} />
          </table>
        </div>
      </div>
    </div>
  );
}
