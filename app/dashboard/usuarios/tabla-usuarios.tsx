'use client';

import Link from 'next/link';
import { User } from 'lucide-react';
import UsuarioActions from './components/UsuarioActions';

interface Usuario {
  id: number;
  username: string;
  nombre: string;
  rol: string;
  estado: boolean;
  creado_en: string;
}

interface UsuariosTableProps {
  users: Usuario[];
  rol: string;
}

export default function UsuariosTableComponent({ users, rol }: UsuariosTableProps) {
  return (
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
          {users.map((usuario) => (
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
                <UsuarioActions usuario={usuario} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
