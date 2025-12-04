export const dynamic = 'force-dynamic';

import { getDb } from '../../../lib/db';
import {
  Plus,
  Search,
  Filter,
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
  mesa: string;
  cliente_nombre: string;
  tipo_entrega: string;
  estado: string;
  total: number;
  fecha: string;
  creado_en: string;
}

async function getPedidos(): Promise<Pedido[]> {
  const db = getDb();
  const pedidos = db.prepare(`
    SELECT
      p.id,
      p.numero_pedido,
      p.mesa_numero as mesa,
      CASE WHEN p.es_para_llevar = 1 THEN 'llevar' ELSE 'mesa' END as tipo_entrega,
      p.estado,
      p.total,
      p.creado_en as fecha,
      p.creado_en
    FROM pedidos p
    ORDER BY p.creado_en DESC
    LIMIT 50
  `).all();

  return pedidos as Pedido[];
}

async function getEstadisticasPedidos() {
  const db = getDb();

  const hoy = new Date().toISOString().split('T')[0];

  const totalHoy = db.prepare(`
    SELECT COUNT(*) as count, SUM(total) as total
    FROM pedidos
    WHERE date(creado_en) = date('now')
  `).get();

  const porEstado = db.prepare(`
    SELECT estado, COUNT(*) as count
    FROM pedidos
    WHERE date(creado_en) = date('now')
    GROUP BY estado
  `).all();

  return {
    totalHoy: totalHoy?.count || 0,
    ventasHoy: totalHoy?.total || 0,
    porEstado: porEstado || []
  };
}

function getEstadoColor(estado: string) {
  switch (estado) {
    case 'pendiente': return 'bg-yellow-100 text-yellow-800';
    case 'preparando': return 'bg-blue-100 text-blue-800';
    case 'listo': return 'bg-green-100 text-green-800';
    case 'entregado': return 'bg-gray-100 text-gray-800';
    case 'cancelado': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getEstadoIcon(estado: string) {
  switch (estado) {
    case 'pendiente': return <Clock className="w-4 h-4" />;
    case 'preparando': return <ChefHat className="w-4 h-4" />;
    case 'listo': return <CheckCircle className="w-4 h-4" />;
    case 'entregado': return <Truck className="w-4 h-4" />;
    case 'cancelado': return <XCircle className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
}

export default async function PedidosPage() {
  const pedidos = await getPedidos();
  const stats = await getEstadisticasPedidos();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-gray-600 mt-1">Gestiona todos los pedidos del restaurante</p>
        </div>
        <a
          href="/dashboard/pedidos/nuevo"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Pedido
        </a>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pedidos Hoy</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalHoy}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ventas Hoy</p>
              <p className="text-3xl font-bold text-gray-900">${stats.ventasHoy.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.porEstado.find((s: any) => s.estado === 'pendiente')?.count || 0}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Preparación</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.porEstado.find((s: any) => s.estado === 'preparando')?.count || 0}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <ChefHat className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar pedidos..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="preparando">Preparando</option>
              <option value="listo">Listo</option>
              <option value="entregado">Entregado</option>
              <option value="cancelado">Cancelado</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Tipo de entrega</option>
              <option value="mesa">En mesa</option>
              <option value="llevar">Para llevar</option>
              <option value="domicilio">Domicilio</option>
            </select>
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition-colors">
              <Filter className="w-4 h-4" />
              Más filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de pedidos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Lista de Pedidos</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente/Mesa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
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
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg mb-2">No hay pedidos</p>
                    <p className="text-sm text-gray-400 mb-4">Los pedidos aparecerán aquí cuando se creen</p>
                    <a
                      href="/dashboard/pedidos/nuevo"
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Crear Primer Pedido
                    </a>
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
                      <div className="text-sm text-gray-900">
                        {pedido.mesa ? `Mesa ${pedido.mesa}` : pedido.cliente_nombre || 'Sin nombre'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        pedido.tipo_entrega === 'mesa' ? 'bg-blue-100 text-blue-800' :
                        pedido.tipo_entrega === 'llevar' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {pedido.tipo_entrega === 'mesa' ? 'En mesa' :
                         pedido.tipo_entrega === 'llevar' ? 'Para llevar' : 'Domicilio'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(pedido.estado)}`}>
                        {getEstadoIcon(pedido.estado)}
                        {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${pedido.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(pedido.fecha).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors">
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