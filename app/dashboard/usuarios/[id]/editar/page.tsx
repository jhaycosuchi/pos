export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getDb } from '../../../../../lib/db';
import { ArrowLeft } from 'lucide-react';
import EditUsuarioForm from './form';

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

export default async function EditarUsuarioPage({
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/usuarios"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Usuario</h1>
          <p className="text-gray-600 mt-1">Actualiza la información del usuario</p>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-2xl">
        <EditUsuarioForm usuario={usuario} />
      </div>
    </div>
  );
}
