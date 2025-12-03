'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Utensils, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API, PAGES, ROUTES, IMAGES } from '@/lib/config';

interface Mesa {
  id: number;
  numero: number;
  capacidad: number;
  estado: 'disponible' | 'ocupada' | 'bloqueada';
  ubicacion: string;
}

interface MesaSelectorProps {
  onSelectMesa?: (mesa: Mesa) => void;
}

export default function DeliveryTypeSelector({ onSelectMesa }: MesaSelectorProps) {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchMesas();
  }, []);

  const fetchMesas = async () => {
    try {
      setLoading(true);
      // Usar ruta relativa para evitar CORS
      const response = await fetch(API.MESAS);
      if (!response.ok) throw new Error('Error al cargar mesas');
      const data = await response.json();
      setMesas(data);
    } catch (err) {
      console.error('Error fetching mesas:', err);
      setError('No se pudieron cargar las mesas');
    } finally {
      setLoading(false);
    }
  };

  const handleMesaSelect = (mesa: Mesa) => {
    if (onSelectMesa) {
      onSelectMesa(mesa);
    } else {
      // Guardar en sessionStorage y navegar
      sessionStorage.setItem('selectedMesa', JSON.stringify(mesa));
      router.push(ROUTES.atiendemeseroConMesa(mesa.numero));
    }
  };

  const mesasDisponibles = mesas.filter(m => m.estado === 'disponible');
  const mesasOcupadas = mesas.filter(m => m.estado === 'ocupada');

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800/95 backdrop-blur-md py-6 px-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <Link
            href={PAGES.ATIENDEMESERO}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Volver</span>
          </Link>
        </div>
        <div className="text-center">
          <Image 
            src={IMAGES.LOGO} 
            alt="Logo" 
            width={80} 
            height={80}
            className="mx-auto mb-4 drop-shadow-lg"
            priority
          />
          <h1 className="text-4xl font-bold text-white mb-2">Mazuhi Sushi</h1>
          <p className="text-gray-400 text-lg">Selecciona una mesa</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Área Activa - Mesas Disponibles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-teal-500/10 rounded-3xl p-8 border-2 border-emerald-500/30"
          >
            <div className="flex items-center gap-3 mb-8">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-4 h-4 bg-emerald-500 rounded-full"
              ></motion.div>
              <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                <Utensils className="w-8 h-8 text-emerald-400" />
                Mesas Disponibles
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-400 text-lg">Cargando mesas...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-400">
                <p className="mb-4">{error}</p>
                <button
                  onClick={fetchMesas}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reintentar
                </button>
              </div>
            ) : mesasDisponibles.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {mesasDisponibles.map((mesa) => (
                  <motion.button
                    key={mesa.id}
                    whileHover={{ scale: 1.08, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleMesaSelect(mesa)}
                    className="relative group"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                    <div className="relative bg-gray-800 rounded-2xl p-6 text-center hover:shadow-2xl transition duration-300 border border-emerald-500/30 group-hover:border-emerald-400">
                      <div className="flex items-center justify-center h-20 mb-4 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg">
                        <Utensils className="w-10 h-10 text-white" />
                      </div>
                      <div className="font-bold text-4xl text-white mb-2">{mesa.numero}</div>
                      <div className="text-sm text-gray-300 mb-2">
                        👥 {mesa.capacidad} {mesa.capacidad === 1 ? 'persona' : 'personas'}
                      </div>
                      <div className="text-xs text-emerald-300 font-semibold mb-3">
                        📍 {mesa.ubicacion}
                      </div>
                      <div className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full font-bold border border-emerald-500/40">
                        ✓ Disponible
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <p className="text-xl">No hay mesas disponibles en este momento</p>
                <p className="text-sm mt-2">Intenta más tarde o selecciona "Para Llevar"</p>
              </div>
            )}
          </motion.div>

          {/* Mesas Ocupadas - Información */}
          {mesasOcupadas.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700"
            >
              <h4 className="text-lg font-bold text-white mb-4">
                ⏳ Mesas Ocupadas ({mesasOcupadas.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {mesasOcupadas.map((mesa) => (
                  <div
                    key={mesa.id}
                    className="bg-gray-700/30 rounded-lg p-3 text-center opacity-50 border border-gray-600"
                  >
                    <div className="text-2xl font-bold text-gray-400 mb-1">{mesa.numero}</div>
                    <div className="text-xs text-gray-500">Ocupada</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-1">
                {mesasDisponibles.length}
              </div>
              <div className="text-sm text-gray-400">Disponibles</div>
            </div>
            <div className="text-center border-l border-r border-gray-700">
              <div className="text-4xl font-bold text-orange-400 mb-1">
                {mesasOcupadas.length}
              </div>
              <div className="text-sm text-gray-400">Ocupadas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-1">
                {mesas.length}
              </div>
              <div className="text-sm text-gray-400">Total</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
