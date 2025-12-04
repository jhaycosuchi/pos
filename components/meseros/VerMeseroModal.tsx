'use client';

import { useState, useEffect } from 'react';
import { X, User, Calendar, CheckCircle, XCircle } from 'lucide-react';

interface Mesero {
  id: number;
  username: string;
  nombre: string;
  rol: string;
  estado: boolean;
  creado_en: string;
}

interface VerMeseroModalProps {
  meseroId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function VerMeseroModal({ meseroId, isOpen, onClose }: VerMeseroModalProps) {
  const [mesero, setMesero] = useState<Mesero | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setMesero(null);
      return;
    }

    const fetchMesero = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch the mesero by ID - since meseros are users with role 'mesero'
        const response = await fetch(`/pos/api/usuarios/${meseroId}`);
        
        if (!response.ok) {
          throw new Error('No se pudo cargar la información del mesero');
        }
        
        const data = await response.json();
        setMesero(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar');
      } finally {
        setLoading(false);
      }
    };

    fetchMesero();
  }, [isOpen, meseroId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Detalles del Mesero</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-800 p-4 rounded-lg">
              {error}
            </div>
          ) : mesero ? (
            <div className="space-y-4">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Nombre</p>
                  <p className="text-lg font-semibold text-gray-900">{mesero.nombre}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Usuario</p>
                  <p className="text-gray-700">@{mesero.username}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Rol</p>
                  <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-medium">
                    {mesero.rol}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Estado</p>
                  <div className="flex items-center gap-1">
                    {mesero.estado ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">Activo</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-600">Inactivo</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">Fecha de Ingreso</p>
                    <p className="text-sm text-gray-700">
                      {new Date(mesero.creado_en).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
