import { getDb } from '../../../lib/db';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  User,
  Users,
  TrendingUp,
  DollarSign,
  ClipboardList,
  Star,
  Clock,
  CheckCircle
} from 'lucide-react';

interface Mesero {
  id: number;
  username: string;
  nombre: string;
  estado: boolean;
  rol: string;
  creado_en: string;
  pedidos_atendidos?: number;
  ventas_totales?: number;
  rating_promedio?: number;
}

async function getMeseros(): Promise<Mesero[]> {
  const db = getDb();

  // Obtener meseros con estadísticas
  const meseros = db.prepare(`
    SELECT
      u.id,
      u.username,
      u.nombre,
      u.estado,
      u.rol,
      u.creado_en,
      COUNT(p.id) as pedidos_atendidos,
      COALESCE(SUM(p.total), 0) as ventas_totales
    FROM usuarios u
    LEFT JOIN pedidos p ON u.id = p.usuario_id AND p.fecha >= date('now', '-30 days')
    WHERE u.rol = 'mesero'
    GROUP BY u.id, u.username, u.nombre, u.estado, u.rol, u.creado_en
    ORDER BY u.nombre
  `).all();

  return meseros as Mesero[];
}

async function getEstadisticasMeseros() {
  const db = getDb();

  const total = db.prepare("SELECT COUNT(*) as count FROM usuarios WHERE rol = 'mesero'").get();
  const activos = db.prepare("SELECT COUNT(*) as count FROM usuarios WHERE rol = 'mesero' AND estado = 1").get();
  const pedidosMes = db.prepare(`
    SELECT COUNT(*) as count
    FROM pedidos p
    JOIN usuarios u ON p.usuario_id = u.id
    WHERE u.rol = 'mesero' AND p.fecha >= date('now', '-30 days')
  `).get();
  const ventasMes = db.prepare(`
    SELECT COALESCE(SUM(p.total), 0) as total
    FROM pedidos p
    JOIN usuarios u ON p.usuario_id = u.id
    WHERE u.rol = 'mesero' AND p.fecha >= date('now', '-30 days')
  `).get();

  return {
    total: total?.count || 0,
    activos: activos?.count || 0,
    pedidosMes: pedidosMes?.count || 0,
    ventasMes: ventasMes?.total || 0
  };
}

export default async function MeserosPage() {
  const meseros = await getMeseros();
  const stats = await getEstadisticasMeseros();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Meseros</h1>
          <p className="text-gray-600 mt-1">Administra el equipo de servicio y su rendimiento</p>
        </div>
        <a
          href="/dashboard/meseros/nuevo"
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Mesero
        </a>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Meseros</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Meseros Activos</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activos}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pedidos (30 días)</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pedidosMes}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <ClipboardList className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ventas (30 días)</p>
              <p className="text-3xl font-bold text-gray-900">${stats.ventasMes.toFixed(2)}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar meseros..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option value="">Ordenar por</option>
              <option value="nombre">Nombre</option>
              <option value="pedidos">Pedidos atendidos</option>
              <option value="ventas">Ventas generadas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de meseros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Equipo de Meseros</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {meseros.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay meseros registrados</h3>
              <p className="text-gray-500 mb-6">Comienza agregando tu primer mesero al equipo</p>
              <a
                href="/dashboard/meseros/nuevo"
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                Agregar Primer Mesero
              </a>
            </div>
          ) : (
            meseros.map((mesero) => (
              <div key={mesero.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{mesero.nombre}</h3>
                      <p className="text-sm text-gray-500">@{mesero.username}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    mesero.estado
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {mesero.estado ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pedidos (30 días)</span>
                    <span className="font-semibold text-gray-900">{mesero.pedidos_atendidos || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ventas generadas</span>
                    <span className="font-semibold text-green-600">${(mesero.ventas_totales || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Fecha de ingreso</span>
                    <span className="text-sm text-gray-500">
                      {new Date(mesero.creado_en).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors">
                    <Eye className="w-4 h-4" />
                    Ver
                  </button>
                  <button className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors">
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}