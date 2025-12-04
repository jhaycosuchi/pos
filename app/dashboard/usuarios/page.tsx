export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getDb } from '../../../lib/db';
import TablaUsuarios from './tabla-usuarios';
import {
  Plus,
  Users,
  Shield,
  ShieldCheck,
  User,
  Settings,
  Search
} from 'lucide-react';

interface Usuario {
  id: number;
  username: string;
  nombre: string;
  rol: string;
  estado: boolean;
  creado_en: string;
}

async function getUsuarios(): Promise<Usuario[]> {
  const db = getDb();
  const usuarios = db.prepare(`
    SELECT
      id,
      username,
      nombre,
      rol,
      activo as estado,
      creado_en
    FROM usuarios
    ORDER BY rol, nombre
  `).all();

  return usuarios as Usuario[];
}

async function getEstadisticasUsuarios() {
  const db = getDb();

  const total = db.prepare('SELECT COUNT(*) as count FROM usuarios').get() as { count: number } | undefined;
  const activos = db.prepare('SELECT COUNT(*) as count FROM usuarios WHERE activo = 1').get() as { count: number } | undefined;
  const porRol = db.prepare('SELECT rol, COUNT(*) as count FROM usuarios GROUP BY rol').all() as Array<{ rol: string; count: number }>;

  return {
    total: total?.count || 0,
    activos: activos?.count || 0,
    porRol: porRol || []
  };
}

function getRolColor(rol: string) {
  switch (rol) {
    case 'admin': return 'bg-red-100 text-red-800';
    case 'caja': return 'bg-blue-100 text-blue-800';
    case 'mesero': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getRolIcon(rol: string) {
  switch (rol) {
    case 'admin': return <ShieldCheck className="w-4 h-4" />;
    case 'caja': return <Settings className="w-4 h-4" />;
    case 'mesero': return <User className="w-4 h-4" />;
    default: return <User className="w-4 h-4" />;
  }
}

export default async function UsuariosPage() {
  const usuarios = await getUsuarios();
  const stats = await getEstadisticasUsuarios();

  // Agrupar por rol
  const usuariosPorRol = usuarios.reduce((acc, usuario) => {
    if (!acc[usuario.rol]) {
      acc[usuario.rol] = [];
    }
    acc[usuario.rol].push(usuario);
    return acc;
  }, {} as Record<string, Usuario[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">Administra usuarios, roles y permisos del sistema</p>
        </div>
        <Link
          href="/dashboard/usuarios/nuevo"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Usuario
        </Link>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
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
              <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activos}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Administradores</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.porRol.filter(r => r.rol === 'admin').reduce((sum, r) => sum + r.count, 0)}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Meseros</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.porRol.filter(r => r.rol === 'mesero').reduce((sum, r) => sum + r.count, 0)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <User className="w-6 h-6 text-purple-600" />
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
                placeholder="Buscar usuarios..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option value="">Todos los roles</option>
              <option value="admin">Administrador</option>
              <option value="caja">Caja</option>
              <option value="mesero">Mesero</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Usuarios por rol */}
      <div className="space-y-6">
        {Object.entries(usuariosPorRol).map(([rol, users]) => (
          <div key={rol} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="text-indigo-600">
                  {getRolIcon(rol)}
                </div>
                <h2 className="text-lg font-semibold text-gray-900 capitalize">{rol}</h2>
                <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                  {users.length} usuario{users.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <TablaUsuarios users={users} rol={rol} />
          </div>
        ))}

        {usuarios.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay usuarios registrados</h3>
            <p className="text-gray-500 mb-6">Comienza creando tu primer usuario administrador</p>
            <Link
              href="/dashboard/usuarios/nuevo"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Crear Usuario Admin
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}