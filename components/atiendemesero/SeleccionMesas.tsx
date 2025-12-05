/**
 * Componente para seleccionar una mesa
 * Muestra las mesas disponibles y permite navegar al menú de la mesa seleccionada
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Mesa {
  numero: string;
  estado: 'libre' | 'ocupada' | 'reservada';
  mesero_id: number | null;
  tiempo_ocupada: number | null;
}

export default function SeleccionMesas() {
  const router = useRouter();
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarMesas();
    
    // Refresco automático cada 5 segundos para detectar cambios en estado de mesas
    const intervalo = setInterval(cargarMesas, 5000);
    
    return () => clearInterval(intervalo);
  }, []);

  const cargarMesas = async () => {
    try {
      setLoading(true);
      const response = await fetch('/pos/api/mesas');
      
      if (!response.ok) {
        throw new Error('Error al cargar mesas');
      }
      
      const data = await response.json();
      // API returns array directly, map estado to match interface
      const mesasData = Array.isArray(data) ? data : (data.mesas || []);
      // Limitar a 6 mesas y mapear estado
      const mesasMapeadas = mesasData
        .slice(0, 6) // Solo las primeras 6 mesas
        .map((mesa: any) => ({
          ...mesa,
          numero: String(mesa.numero),
          estado: mesa.estado === 'disponible' ? 'libre' : (mesa.estado === 'ocupada' ? 'ocupada' : 'reservada')
        }));
      setMesas(mesasMapeadas);
    } catch (error) {
      console.error('Error al cargar mesas:', error);
      alert('Error al cargar las mesas');
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionarMesa = (mesaNumero: string) => {
    router.push(`/atiendemesero/mesa/${mesaNumero}`);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'libre':
        return 'bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 border-green-400 shadow-xl shadow-green-500/50';
      case 'ocupada':
        return 'bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 border-orange-400 shadow-xl shadow-orange-500/50';
      case 'reservada':
        return 'bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 border-red-400 shadow-xl shadow-red-500/50';
      default:
        return 'bg-gradient-to-br from-gray-600 to-gray-800 hover:from-gray-500 hover:to-gray-700 border-gray-400';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'libre':
        return 'Libre';
      case 'ocupada':
        return 'Ocupada';
      case 'reservada':
        return 'Reservada';
      default:
        return 'Desconocido';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Cargando mesas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 p-2 sm:p-3 md:p-4 lg:p-6">
      {/* Header */}
      <div className="w-full mb-3 sm:mb-4 md:mb-6">
        <div className="bg-gray-800/80 backdrop-blur-md rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl p-3 sm:p-4 md:p-6 border border-gray-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-white mb-0.5 sm:mb-2">🍽️ Mesas</h1>
              <p className="text-blue-400 text-xs sm:text-sm md:text-lg font-medium">Elige una mesa</p>
            </div>
            <button
              onClick={() => router.push('/atiendemesero')}
              className="w-full sm:w-auto px-3 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-lg sm:rounded-xl md:rounded-xl hover:from-gray-600 hover:to-gray-500 transition-all transform hover:scale-105 font-bold text-xs sm:text-sm md:text-lg shadow-lg"
            >
              ← Volver
            </button>
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="w-full mb-3 sm:mb-4 md:mb-8">
        <div className="bg-gray-800/60 backdrop-blur-md rounded-lg sm:rounded-xl md:rounded-2xl shadow-xl p-3 sm:p-4 md:p-6 border border-gray-700">
          <h3 className="text-xs sm:text-sm md:text-lg font-bold text-white mb-2 sm:mb-4">Estado:</h3>
          <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-6">
            <div className="flex items-center">
              <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-gradient-to-br from-green-500 to-emerald-600 rounded mr-2 sm:mr-3 shadow-lg shadow-green-500/50"></div>
              <span className="text-gray-300 font-medium text-xs sm:text-sm md:text-base">Libre</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-gradient-to-br from-orange-500 to-red-500 rounded mr-2 sm:mr-3 shadow-lg shadow-orange-500/50"></div>
              <span className="text-gray-300 font-medium text-xs sm:text-sm md:text-base">Ocupada</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-gradient-to-br from-red-600 to-red-800 rounded mr-2 sm:mr-3 shadow-lg shadow-red-500/50"></div>
              <span className="text-gray-300 font-medium text-xs sm:text-sm md:text-base">Reservada</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de mesas */}
      <div className="max-w-7xl mx-auto">
        {mesas.length === 0 ? (
          <div className="bg-gray-800/60 backdrop-blur-md rounded-2xl shadow-xl p-16 text-center border border-gray-700">
            <div className="text-6xl mb-6">🚫</div>
            <p className="text-gray-300 text-2xl font-bold mb-3">No hay mesas disponibles</p>
            <p className="text-gray-500 text-lg">Contacta al administrador para configurar las mesas</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 max-w-7xl mx-auto">
            {mesas.map((mesa) => (
              <button
                key={mesa.numero}
                onClick={() => handleSeleccionarMesa(mesa.numero)}
                disabled={mesa.estado !== 'libre'}
                className={`${getEstadoColor(mesa.estado)} text-white rounded-lg md:rounded-xl shadow-lg md:shadow-2xl transition-all transform hover:scale-105 md:hover:scale-110 hover:-translate-y-1 md:hover:-translate-y-2 p-2 sm:p-3 md:p-4 lg:p-6 flex flex-col items-center justify-center relative overflow-hidden group border-2 disabled:cursor-not-allowed`}
              >
                {/* Background glow effect */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity ${
                  mesa.estado === 'libre' ? 'bg-green-400' : mesa.estado === 'ocupada' ? 'bg-orange-400' : 'bg-red-400'
                }`}></div>
                
                <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-0.5 sm:mb-1 md:mb-2 relative z-10 drop-shadow-2xl">{mesa.numero}</div>
                <div className="text-xs sm:text-sm md:text-base lg:text-lg font-bold mb-0.5 sm:mb-1 md:mb-2 relative z-10">{getEstadoTexto(mesa.estado)}</div>
                {mesa.tiempo_ocupada && mesa.tiempo_ocupada > 0 && (
                  <div className="text-xs opacity-90 relative z-10 bg-black/30 px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 md:py-1.5 rounded text-xs sm:text-xs md:text-sm">
                    ⏱️ {Math.floor(mesa.tiempo_ocupada / 60)}h {mesa.tiempo_ocupada % 60}m
                  </div>
                )}
                
                {/* Arrow indicator on hover */}
                <div className="absolute bottom-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  <span className="text-sm md:text-lg">→</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
