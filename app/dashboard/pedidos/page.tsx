export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getDb } from '../../../lib/db';
import {
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Users
} from 'lucide-react';
import CuentasTableClient from './page-client';

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

async function getCuentas(): Promise<Cuenta[]> {
  const db = getDb();
  const cuentas = db.prepare(`
    SELECT
      c.id,
      c.mesa_numero,
      u.nombre as mesero_nombre,
      c.estado,
      c.total,
      c.metodo_pago,
      c.fecha_apertura as creado_en,
      COUNT(p.id) as pedido_count
    FROM cuentas c
    LEFT JOIN usuarios u ON c.mesero_id = u.id
    LEFT JOIN pedidos p ON c.id = p.cuenta_id
    GROUP BY c.id
    ORDER BY c.fecha_apertura DESC
    LIMIT 100
  `).all();

  return cuentas as Cuenta[];
}

async function getEstadisticasCuentas() {
  const db = getDb();

  const totalCuentas = db.prepare(`
    SELECT COUNT(*) as count, SUM(total) as total
    FROM cuentas
  `).get();

  const porEstado = db.prepare(`
    SELECT UPPER(estado) as estado, COUNT(*) as count
    FROM cuentas
    GROUP BY UPPER(estado)
  `).all();

  return {
    totalCuentas: totalCuentas?.count || 0,
    ventasTotal: totalCuentas?.total || 0,
    porEstado: porEstado || []
  };
}

function getEstadoColor(estado: string) {
  switch (estado?.toUpperCase()) {
    case 'ABIERTA': return 'bg-blue-100 text-blue-800';
    case 'CERRADA': return 'bg-yellow-100 text-yellow-800';
    case 'COBRADA': return 'bg-green-100 text-green-800';
    case 'CANCELADA': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getEstadoIcon(estado: string) {
  switch (estado?.toUpperCase()) {
    case 'ABIERTA': return <Clock className="w-4 h-4" />;
    case 'CERRADA': return <CheckCircle className="w-4 h-4" />;
    case 'COBRADA': return <CheckCircle className="w-4 h-4" />;
    case 'CANCELADA': return <XCircle className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
}

export default async function PedidosPage() {
  const cuentas = await getCuentas();
  const stats = await getEstadisticasCuentas();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pedidos / Cuentas</h1>
        <p className="text-gray-600 mt-1">Gestiona todas las cuentas y pedidos del restaurante</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cuentas</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalCuentas}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ventas Total</p>
              <p className="text-3xl font-bold text-gray-900">${stats.ventasTotal?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Abiertas</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.porEstado.find((s: any) => s.estado === 'ABIERTA')?.count || 0}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cerradas</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.porEstado.find((s: any) => s.estado === 'CERRADA')?.count || 0}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de cuentas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Todas las Cuentas</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mesa/Cuenta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mesero
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pedidos
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
                  Fecha Creación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <CuentasTableClient cuentas={cuentas} />
          </table>
        </div>
      </div>
    </div>
  );
}
