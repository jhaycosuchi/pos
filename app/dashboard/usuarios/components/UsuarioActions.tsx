'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Edit, Trash2 } from 'lucide-react';

interface Usuario {
  id: number;
  username: string;
  nombre: string;
  rol: string;
  estado: boolean;
  creado_en: string;
}

export default function UsuarioActions({ usuario }: { usuario: Usuario }) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDelete = async () => {
    setDeleteError('');
    setDeleting(true);

    try {
      const response = await fetch(`/pos/api/usuarios/${usuario.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        setDeleteError(data.message || 'Error al eliminar el usuario');
        setDeleting(false);
        return;
      }

      // Refresh the page
      router.refresh();
      setShowDeleteModal(false);
    } catch (err) {
      setDeleteError('Error de conexión');
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Link
          href={`/dashboard/usuarios/${usuario.id}`}
          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
          title="Ver detalles"
        >
          <Eye className="w-4 h-4" />
        </Link>
        <Link
          href={`/dashboard/usuarios/${usuario.id}/editar`}
          className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50 transition-colors"
          title="Editar usuario"
        >
          <Edit className="w-4 h-4" />
        </Link>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
          title="Eliminar usuario"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirmar eliminación
            </h3>
            <p className="text-gray-600 mb-4">
              ¿Estás seguro de que deseas eliminar a <strong>{usuario.nombre}</strong>? Esta acción no se puede deshacer.
            </p>

            {deleteError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-800 text-sm">{deleteError}</p>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
