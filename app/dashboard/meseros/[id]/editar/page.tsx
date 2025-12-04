import { getDb } from '../../../../../lib/db';
import EditMeseroForm from './form';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    id: string;
  };
}

async function getMesero(id: string) {
  const db = getDb();
  const mesero = db.prepare(`
    SELECT id, username, nombre, rol, activo as estado, creado_en
    FROM usuarios
    WHERE id = ? AND rol = 'mesero'
  `).get(id);

  return mesero;
}

export default async function EditMeseroPage({ params }: PageProps) {
  const mesero = await getMesero(params.id);

  if (!mesero) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Editar Mesero</h1>
        <p className="text-gray-600 mt-1">Actualiza la información del mesero</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <EditMeseroForm mesero={mesero} />
      </div>
    </div>
  );
}
