'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function MeseroForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    nombre: '',
    username: '',
    password: '',
    confirmPassword: '',
    activo: '1',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones
    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }
    if (!formData.username.trim()) {
      setError('El nombre de usuario es requerido');
      return;
    }
    if (!formData.password) {
      setError('La contraseña es requerida');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/pos/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          username: formData.username,
          password: formData.password,
          rol: 'mesero',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error creando mesero');
      }

      setSuccess('¡Mesero creado exitosamente!');
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/dashboard/meseros');
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span className="text-green-700">{success}</span>
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
            placeholder="Juan Pérez"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
            placeholder="juan.perez"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>

        {/* Contraseña */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contraseña *
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>

        {/* Confirmar Contraseña */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirmar Contraseña *
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Estado */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Estado
        </label>
        <select
          name="activo"
          value={formData.activo}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="1">Activo</option>
          <option value="0">Inactivo</option>
        </select>
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            loading
              ? 'bg-purple-400 text-white cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          {loading ? 'Guardando...' : 'Guardar Mesero'}
        </button>
        <Link
          href="/dashboard/meseros"
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
