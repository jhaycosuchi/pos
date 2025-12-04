'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  usuarioId: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirmed: () => void;
}

export default function ConfirmDeleteModal({
  usuarioId,
  isOpen,
  onClose,
  onConfirmed,
}: ConfirmDeleteModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/pos/api/usuarios/${usuarioId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Error al eliminar el usuario');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onConfirmed();
        onClose();
      }, 1500);
    } catch (err) {
      setError('Error de conexión: ' + (err instanceof Error ? err.message : 'Error desconocido'));
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Eliminar Usuario</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {success ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <p className="text-green-800 font-medium">Usuario eliminado exitosamente</p>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-4 mb-4">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-medium">¿Estás seguro?</p>
                  <p className="text-gray-600 text-sm mt-1">
                    Esta acción no se puede deshacer. El usuario será eliminado permanentemente del sistema.
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm mb-4">
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
