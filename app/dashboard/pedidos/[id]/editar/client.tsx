'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

interface Cuenta {
  id: number;
  mesa_numero: string;
  mesero_id: number;
  estado: string;
  total: number;
  fecha_apertura: string;
}

interface Mesero {
  id: number;
  nombre: string;
  username: string;
}

interface EditarCuentaClientProps {
  cuenta: Cuenta;
  meseros: Mesero[];
}

export default function EditarCuentaClient({ cuenta, meseros }: EditarCuentaClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    mesa_numero: cuenta.mesa_numero,
    mesero_id: cuenta.mesero_id,
    estado: cuenta.estado,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/pos/api/cuentas/${cuenta.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('Cuenta actualizada exitosamente');
        router.push(`/dashboard/pedidos/${cuenta.id}`);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al actualizar la cuenta');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/dashboard/pedidos/${cuenta.id}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la cuenta
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Editar Cuenta #{cuenta.id}</h1>
        <p className="text-gray-600 mt-2">Modifica la información de la cuenta</p>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mesa */}
          <div>
            <label htmlFor="mesa_numero" className="block text-sm font-medium text-gray-700 mb-2">
              Número de Mesa
            </label>
            <input
              type="text"
              id="mesa_numero"
              value={formData.mesa_numero}
              onChange={(e) => setFormData({ ...formData, mesa_numero: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Mesero */}
          <div>
            <label htmlFor="mesero_id" className="block text-sm font-medium text-gray-700 mb-2">
              Mesero Asignado
            </label>
            <select
              id="mesero_id"
              value={formData.mesero_id}
              onChange={(e) => setFormData({ ...formData, mesero_id: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Seleccionar mesero</option>
              {meseros.map((mesero) => (
                <option key={mesero.id} value={mesero.id}>
                  {mesero.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Estado */}
          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-2">
              Estado de la Cuenta
            </label>
            <select
              id="estado"
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="abierta">Abierta</option>
              <option value="cerrada">Cerrada</option>
              <option value="cobrada">Cobrada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          {/* Info adicional */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Información Adicional</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total:</span>
                <span className="ml-2 font-medium text-gray-900">${cuenta.total.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-600">Fecha apertura:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {new Date(cuenta.fecha_apertura).toLocaleDateString('es-ES')}
                </span>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <Link
              href={`/dashboard/pedidos/${cuenta.id}`}
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 flex items-center justify-center gap-2 font-medium transition-colors"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
