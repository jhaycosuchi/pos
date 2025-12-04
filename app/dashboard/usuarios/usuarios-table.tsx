'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, Edit, Trash2, ShieldCheck, User } from 'lucide-react';
import VerUsuarioModal from '../../../components/usuarios/VerUsuarioModal';
import ConfirmDeleteModal from '../../../components/usuarios/ConfirmDeleteModal';

interface Usuario {
  id: number;
  username: string;
  nombre: string;
  rol: string;
  estado: boolean;
  creado_en: string;
}

interface UsuariosTableProps {
  rol: string;
  usuarios: Usuario[];
}

function getRolIcon(rol: string) {
  switch (rol) {
    case 'admin': return <ShieldCheck className="w-4 h-4" />;
    default: return <User className="w-4 h-4" />;
  }
}

export default function UsuariosTable({ rol, usuarios }: UsuariosTableProps) {
  const [verModalOpen, setVerModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [usuariosList, setUsuariosList] = useState(usuarios);

  const handleVerClick = (id: number) => {
    setSelectedUserId(id);
    setVerModalOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setSelectedUserId(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirmed = () => {
    if (selectedUserId) {
      setUsuariosList(usuariosList.filter(u => u.id !== selectedUserId));
    }
    setDeleteModalOpen(false);
    setSelectedUserId(null);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="text-indigo-600">
              {getRolIcon(rol)}
            </div>
            <h2 className="text-lg font-semibold text-gray-900 capitalize">{rol}</h2>
            <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
              {usuariosList.length} usuario{usuariosList.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Creado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usuariosList.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{usuario.nombre}</div>
                        <div className="text-sm text-gray-500">@{usuario.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      usuario.estado
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {usuario.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(usuario.creado_en).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVerClick(usuario.id)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                        title="Ver usuario"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/dashboard/usuarios/${usuario.id}/editar`}
                        className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50 transition-colors"
                        title="Editar usuario"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(usuario.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Eliminar usuario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {selectedUserId && (
        <>
          <VerUsuarioModal
            usuarioId={selectedUserId}
            isOpen={verModalOpen}
            onClose={() => setVerModalOpen(false)}
          />
          <ConfirmDeleteModal
            usuarioId={selectedUserId}
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onConfirmed={handleDeleteConfirmed}
          />
        </>
      )}
    </>
  );
}
