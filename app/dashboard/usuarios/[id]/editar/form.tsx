'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface Usuario {
  id: number;
  username: string;
  nombre: string;
  rol: string;
  estado: boolean;
  creado_en: string;
}

interface EditUsuarioFormProps {
  usuario: Usuario;
}

export default function EditUsuarioForm({ usuario }: EditUsuarioFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: usuario.nombre,
    username: usuario.username,
    rol: usuario.rol,
    activo: usuario.estado,
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validación
    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!formData.username.trim()) {
      setError('El nombre de usuario es requerido');
      return;
    }

    if (!formData.rol) {
      setError('El rol es requerido');
      return;
    }

    // Validar contraseña si se proporciona
    if (formData.password || formData.confirmPassword) {
      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
    }

    setLoading(true);

    try {
      const response = await fetch(`/pos/api/usuarios/${usuario.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          username: formData.username,
          rol: formData.rol,
          activo: formData.activo,
          ...(formData.password && { password: formData.password }),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Error al actualizar el usuario');
        setLoading(false);
        return;
      }

      const data = await response.json();
      setSuccess('Usuario actualizado exitosamente');

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(`/dashboard/usuarios/${usuario.id}`);
      }, 2000);
    } catch (err) {
      setError('Error de conexión: ' + (err instanceof Error ? err.message : 'Error desconocido'));
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-800">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre Completo *
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Nombre del usuario"
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            required
          />
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de Usuario *
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="usuario_nombre"
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            required
          />
        </div>

        {/* Rol */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rol *
          </label>
          <select
            name="rol"
            value={formData.rol}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            required
          >
            <option value="mesero">Mesero</option>
            <option value="caja">Caja</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <select
            name="activo"
            value={formData.activo ? '1' : '0'}
            onChange={(e) => {
              setFormData(prev => ({
                ...prev,
                activo: e.target.value === '1'
              }));
            }}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
          >
            <option value="1">Activo</option>
            <option value="0">Inactivo</option>
          </select>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 pt-6">
        <p className="text-sm font-medium text-gray-600 mb-4">Cambiar Contraseña (Opcional)</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nueva Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Dejar en blanco para mantener actual"
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirmar nueva contraseña"
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          {loading ? 'Actualizando...' : 'Guardar Cambios'}
        </button>
        <button
          type="button"
          onClick={() => window.history.back()}
          disabled={loading}
          className="bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
