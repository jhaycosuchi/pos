import { cookies } from 'next/headers';
import { verifyToken } from '../../lib/auth';
import { getDb } from '../../lib/db';
import {
  ClipboardList,
  DollarSign,
  Tag,
  ChefHat,
  Users,
  Utensils
} from 'lucide-react';

async function getDashboardStats() {
  const db = getDb();

  // Estadísticas básicas
  const pedidosCount = db.prepare("SELECT COUNT(*) as count FROM pedidos WHERE date(creado_en) = date('now')").get();
  const productosCount = db.prepare('SELECT COUNT(*) as count FROM menu_items WHERE disponible = 1').get();
  const totalVentas = db.prepare("SELECT SUM(total) as total FROM pedidos WHERE date(creado_en) = date('now') AND estado = 'completado'").get();

  return {
    pedidosHoy: pedidosCount?.count || 0,
    productosActivos: productosCount?.count || 0,
    ventasHoy: totalVentas?.total || 0,
  };
}

export default async function DashboardPage() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return null; // El middleware debería redirigir
  }

  const user = verifyToken(token);
  if (!user) {
    return null;
  }

  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
        <div className="text-sm text-gray-600">
          {new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-secondary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pedidos Hoy</p>
              <p className="text-3xl font-bold text-primary">{stats.pedidosHoy}</p>
            </div>
            <ClipboardList className="h-12 w-12 text-secondary" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-accent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Productos Activos</p>
              <p className="text-3xl font-bold text-primary">{stats.productosActivos}</p>
            </div>
            <Utensils className="h-12 w-12 text-accent" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-success">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ventas Hoy</p>
              <p className="text-3xl font-bold text-primary">${stats.ventasHoy.toFixed(2)}</p>
            </div>
            <DollarSign className="h-12 w-12 text-success" />
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-primary">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <a
            href="/pedidos/nuevo"
            className="bg-secondary text-white p-4 rounded-lg hover:bg-blue-600 transition-colors text-center flex flex-col items-center justify-center space-y-2"
          >
            <ClipboardList className="h-6 w-6" />
            <div className="font-medium">Nuevo Pedido</div>
          </a>

          <a
            href="/pedidos"
            className="bg-primary text-white p-4 rounded-lg hover:bg-gray-800 transition-colors text-center flex flex-col items-center justify-center space-y-2"
          >
            <ClipboardList className="h-6 w-6" />
            <div className="font-medium">Ver Pedidos</div>
          </a>

          <a
            href="/caja"
            className="bg-accent text-white p-4 rounded-lg hover:bg-yellow-600 transition-colors text-center flex flex-col items-center justify-center space-y-2"
          >
            <DollarSign className="h-6 w-6" />
            <div className="font-medium">Control Caja</div>
          </a>

          <a
            href="/menu"
            className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors text-center flex flex-col items-center justify-center space-y-2"
          >
            <Utensils className="h-6 w-6" />
            <div className="font-medium">Gestionar Menú</div>
          </a>

          <a
            href="/precios"
            className="bg-success text-white p-4 rounded-lg hover:bg-green-600 transition-colors text-center flex flex-col items-center justify-center space-y-2"
          >
            <Tag className="h-6 w-6" />
            <div className="font-medium">Gestionar Precios</div>
          </a>

          <a
            href="/meseros"
            className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors text-center flex flex-col items-center justify-center space-y-2"
          >
            <ChefHat className="h-6 w-6" />
            <div className="font-medium">Gestionar Meseros</div>
          </a>
        </div>
      </div>

      {/* Pedidos recientes */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-primary">Pedidos Recientes</h2>
        <div className="text-center text-gray-500 py-8">
          <ClipboardList className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p>No hay pedidos recientes</p>
          <a href="/pedidos/nuevo" className="btn-primary mt-4 inline-block">
            Crear Primer Pedido
          </a>
        </div>
      </div>
    </div>
  );
}