export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getDb } from '../../../../lib/db';
import { ArrowLeft, Edit, Trash2, User } from 'lucide-react';

interface Usuario {
  id: number;
  username: string;
  nombre: string;
  rol: string;
  estado: boolean;
  creado_en: string;
}

async function getUsuario(id: string): Promise<Usuario | null> {
  const db = getDb();
  const usuario = db.prepare(`
    SELECT
      id,
      username,
      nombre,
      rol,
      activo as estado,
      creado_en
    FROM usuarios
    WHERE id = ?
  `).get(id);

  return usuario as Usuario | null;
}

export default async function VerUsuarioPage({
  params,
}: {
  params: { id: string };
}) {
  const usuario = await getUsuario(params.id);

  if (!usuario) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/usuarios"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Usuario no encontrado</h1>
          </div>
        </div>
      </div>
    );
  }

  const getRolColor = (rol: string) => {
    switch (rol) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'caja':
        return 'bg-blue-100 text-blue-800';
      case 'mesero':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/usuarios"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Detalles del Usuario</h1>
            <p className="text-gray-600 mt-1">Información completa del usuario</p>
          </div>
        </div>
        <Link
          href={`/dashboard/usuarios/${usuario.id}/editar`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Edit className="w-5 h-5" />
          Editar
        </Link>
      </div>

      {/* Tarjeta de Usuario */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{usuario.nombre}</h2>
              <p className="text-gray-600 mt-1">@{usuario.username}</p>
            </div>
          </div>
          <span
            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getRolColor(
              usuario.rol
            )}`}
          >
            {usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Estado</p>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  usuario.estado ? 'bg-green-500' : 'bg-red-500'
                }`}
              ></div>
              <span className="text-lg font-semibold text-gray-900">
                {usuario.estado ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Rol</p>
            <span className="text-lg font-semibold text-gray-900 capitalize">
              {usuario.rol}
            </span>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Fecha de Creación</p>
            <span className="text-lg font-semibold text-gray-900">
              {new Date(usuario.creado_en).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Nombre de Usuario</p>
            <p className="text-lg text-gray-900 font-mono">{usuario.username}</p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-600 mb-2">ID en Sistema</p>
            <p className="text-lg text-gray-900 font-mono">#{usuario.id}</p>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-3">
        <Link
          href={`/dashboard/usuarios/${usuario.id}/editar`}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Edit className="w-5 h-5" />
          Editar Usuario
        </Link>
        <Link
          href="/dashboard/usuarios"
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors text-center"
        >
          Volver
        </Link>
      </div>
    </div>
  );
}
