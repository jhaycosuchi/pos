'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, Edit, Trash2, User, CheckCircle } from 'lucide-react';
import VerMeseroModal from '../../../components/meseros/VerMeseroModal';
import ConfirmDeleteMeseroModal from '../../../components/meseros/ConfirmDeleteMeseroModal';

interface Mesero {
  id: number;
  username: string;
  nombre: string;
  estado: boolean;
  rol: string;
  creado_en: string;
  pedidos_atendidos?: number;
  ventas_totales?: number;
  rating_promedio?: number;
}

interface MeserosCardGridProps {
  meseros: Mesero[];
}

export default function MeserosCardGrid({ meseros: initialMeseros }: MeserosCardGridProps) {
  const [meseros, setMeseros] = useState(initialMeseros);
  const [verModalOpen, setVerModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMeseroId, setSelectedMeseroId] = useState<number | null>(null);

  const handleVerClick = (id: number) => {
    setSelectedMeseroId(id);
    setVerModalOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setSelectedMeseroId(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirmed = () => {
    if (selectedMeseroId) {
      setMeseros(meseros.filter(m => m.id !== selectedMeseroId));
    }
    setDeleteModalOpen(false);
    setSelectedMeseroId(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {meseros.map((mesero) => (
          <div key={mesero.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{mesero.nombre}</h3>
                  <p className="text-sm text-gray-500">@{mesero.username}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                mesero.estado
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {mesero.estado ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pedidos (30 días)</span>
                <span className="font-semibold text-gray-900">{mesero.pedidos_atendidos || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ventas generadas</span>
                <span className="font-semibold text-green-600">${(mesero.ventas_totales || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Fecha de ingreso</span>
                <span className="text-sm text-gray-500">
                  {new Date(mesero.creado_en).toLocaleDateString('es-ES')}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleVerClick(mesero.id)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Ver
              </button>
              <Link
                href={`/dashboard/meseros/${mesero.id}/editar`}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Editar
              </Link>
              <button
                onClick={() => handleDeleteClick(mesero.id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {selectedMeseroId && (
        <>
          <VerMeseroModal
            meseroId={selectedMeseroId}
            isOpen={verModalOpen}
            onClose={() => setVerModalOpen(false)}
          />
          <ConfirmDeleteMeseroModal
            meseroId={selectedMeseroId}
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onConfirmed={handleDeleteConfirmed}
          />
        </>
      )}
    </>
  );
}
