'use client';

import { useState, useEffect } from 'react';
import { X, User, Mail, Shield, Calendar } from 'lucide-react';

interface Usuario {
  id: number;
  username: string;
  nombre: string;
  rol: string;
  estado: boolean;
  creado_en: string;
}

interface VerUsuarioModalProps {
  usuarioId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function VerUsuarioModal({ usuarioId, isOpen, onClose }: VerUsuarioModalProps) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && usuarioId) {
      fetchUsuario();
    }
  }, [isOpen, usuarioId]);

  const fetchUsuario = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/pos/api/usuarios/${usuarioId}`);
      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Error al cargar el usuario');
        return;
      }
      const data = await response.json();
      setUsuario(data);
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Detalles del Usuario</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">Cargando...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
              {error}
            </div>
          )}

          {usuario && (
            <div className="space-y-4">
              {/* Avatar */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-purple-600" />
                </div>
              </div>

              {/* Info */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Nombre</label>
                <p className="text-gray-900 font-semibold">{usuario.nombre}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Usuario</label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">@{usuario.username}</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Rol</label>
                <div className="flex items-center gap-2 mt-1">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
                    usuario.rol === 'admin' ? 'bg-red-100 text-red-800' :
                    usuario.rol === 'caja' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {usuario.rol}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Estado</label>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  usuario.estado
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {usuario.estado ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Fecha de Creación</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">
                    {new Date(usuario.creado_en).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
