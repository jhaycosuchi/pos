'use client';

import { useState } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

interface ConfirmDeleteMeseroModalProps {
  meseroId: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirmed: () => void;
}

export default function ConfirmDeleteMeseroModal({
  meseroId,
  isOpen,
  onClose,
  onConfirmed
}: ConfirmDeleteMeseroModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/pos/api/usuarios/${meseroId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al eliminar el mesero');
      }

      onConfirmed();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-red-600">Eliminar Mesero</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {error ? (
            <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-4">
              {error}
            </div>
          ) : null}

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-2">
                ¿Está seguro de que desea eliminar este mesero?
              </p>
              <p className="text-sm text-gray-600">
                Esta acción es permanente y no se puede deshacer. El mesero será eliminado del sistema.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 rounded-b-lg flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Eliminar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
