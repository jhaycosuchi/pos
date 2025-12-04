export const dynamic = 'force-dynamic';

import { getDb } from '../../../lib/db';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  PieChart,
  DollarSign,
  Users,
  Package,
  Clock,
  FileText
} from 'lucide-react';

interface ReporteVentas {
  fecha: string;
  total_ventas: number;
  total_pedidos: number;
  promedio_pedido: number;
}

interface ReporteProductos {
  nombre: string;
  categoria: string;
  cantidad_vendida: number;
  ingresos_generados: number;
}

interface ReporteMeseros {
  nombre: string;
  pedidos_atendidos: number;
  ventas_totales: number;
  promedio_pedido: number;
}

async function getReportesVentas(periodo: string = '30'): Promise<ReporteVentas[]> {
  const db = getDb();
  const dias = parseInt(periodo);

  const ventas = db.prepare(`
    SELECT
      date(creado_en) as fecha,
      SUM(total) as total_ventas,
      COUNT(*) as total_pedidos,
      AVG(total) as promedio_pedido
    FROM pedidos
    WHERE creado_en >= date('now', '-${dias} days') AND estado = 'entregado'
    GROUP BY date(creado_en)
    ORDER BY fecha DESC
  `).all();

  return ventas as ReporteVentas[];
}

async function getReportesProductos(periodo: string = '30'): Promise<ReporteProductos[]> {
  const db = getDb();
  const dias = parseInt(periodo);

  const productos = db.prepare(`
    SELECT
      mi.nombre,
      mc.nombre as categoria,
      SUM(dp.cantidad) as cantidad_vendida,
      SUM(dp.subtotal) as ingresos_generados
    FROM detalle_pedidos dp
    JOIN menu_items mi ON dp.menu_item_id = mi.id
    LEFT JOIN menu_categorias mc ON mi.categoria_id = mc.id
    JOIN pedidos p ON dp.pedido_id = p.id
    WHERE p.creado_en >= date('now', '-${dias} days') AND p.estado = 'entregado'
    GROUP BY mi.id, mi.nombre, mc.nombre
    ORDER BY ingresos_generados DESC
    LIMIT 10
  `).all();

  return productos as ReporteProductos[];
}

async function getReportesMeseros(periodo: string = '30'): Promise<ReporteMeseros[]> {
  const db = getDb();
  const dias = parseInt(periodo);

  const meseros = db.prepare(`
    SELECT
      u.nombre,
      COUNT(p.id) as pedidos_atendidos,
      SUM(p.total) as ventas_totales,
      AVG(p.total) as promedio_pedido
    FROM usuarios u
    LEFT JOIN pedidos p ON u.id = p.usuario_id AND p.creado_en >= date('now', '-${dias} days') AND p.estado = 'entregado'
    WHERE u.rol = 'mesero'
    GROUP BY u.id, u.nombre
    ORDER BY ventas_totales DESC
  `).all();

  return meseros as ReporteMeseros[];
}

async function getEstadisticasGenerales(periodo: string = '30') {
  const db = getDb();
  const dias = parseInt(periodo);

  const stats = db.prepare(`
    SELECT
      COUNT(DISTINCT p.id) as total_pedidos,
      SUM(p.total) as total_ventas,
      AVG(p.total) as promedio_pedido,
      COUNT(DISTINCT u.id) as meseros_activos
    FROM pedidos p
    JOIN usuarios u ON p.usuario_id = u.id
    WHERE p.creado_en >= date('now', '-${dias} days') AND p.estado = 'entregado'
  `).get();

  return stats;
}

export default async function ReportesPage() {
  const periodo = '30'; // días
  const ventas = await getReportesVentas(periodo);
  const productos = await getReportesProductos(periodo);
  const meseros = await getReportesMeseros(periodo);
  const stats = await getEstadisticasGenerales(periodo);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes y Analytics</h1>
          <p className="text-gray-600 mt-1">Análisis detallado del rendimiento del restaurante</p>
        </div>
        <div className="flex gap-3">
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="7">Últimos 7 días</option>
            <option value="30" selected>Últimos 30 días</option>
            <option value="90">Últimos 90 días</option>
            <option value="365">Último año</option>
          </select>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pedidos</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.total_pedidos || 0}</p>
              <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                +12% vs período anterior
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Ventas</p>
              <p className="text-3xl font-bold text-gray-900">${(stats?.total_ventas || 0).toFixed(2)}</p>
              <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                +8% vs período anterior
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Promedio por Pedido</p>
              <p className="text-3xl font-bold text-gray-900">${(stats?.promedio_pedido || 0).toFixed(2)}</p>
              <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                <TrendingDown className="w-3 h-3" />
                -2% vs período anterior
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Meseros Activos</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.meseros_activos || 0}</p>
              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                <Users className="w-3 h-3" />
                En el período
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos y reportes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventas por día */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Ventas Diarias</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {ventas.slice(0, 7).map((venta) => (
              <div key={venta.fecha} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {new Date(venta.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">${venta.total_ventas.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">{venta.total_pedidos} pedidos</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Productos más vendidos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Productos Más Vendidos</h3>
            <Package className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {productos.slice(0, 5).map((producto, index) => (
              <div key={producto.nombre} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{producto.nombre}</div>
                    <div className="text-xs text-gray-500">{producto.categoria}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{producto.cantidad_vendida} vendidos</div>
                  <div className="text-xs text-green-600">${producto.ingresos_generados.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rendimiento de meseros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Rendimiento de Meseros
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mesero
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pedidos Atendidos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ventas Totales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Promedio por Pedido
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {meseros.map((mesero) => (
                <tr key={mesero.nombre} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{mesero.nombre}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{mesero.pedidos_atendidos}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">${mesero.ventas_totales.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${mesero.promedio_pedido.toFixed(2)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}