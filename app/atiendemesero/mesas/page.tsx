'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Utensils, ArrowLeft, Lock, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { API, PAGES, IMAGES, ESTADOS } from '@/lib/config';

interface Mesa {
  id: number;
  numero: number;
  capacidad: number;
  estado: 'disponible' | 'ocupada' | 'bloqueada';
  ubicacion: string;
}

interface CuentaActiva {
  id: number;
  numero_cuenta: string;
  mesa_numero: number | string | null;
  estado: string;
}

export default function MesasPage() {
  const router = useRouter();
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [cuentasActivas, setCuentasActivas] = useState<CuentaActiva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch mesas
      const mesasRes = await fetch(API.MESAS);
      if (!mesasRes.ok) throw new Error('Error al cargar mesas');
      const mesasData = await mesasRes.json();
      setMesas(mesasData);
      
      // Fetch cuentas abiertas y cerradas (no cobradas)
      const cuentasAbiertasRes = await fetch(`${API.CUENTAS}?estado=${ESTADOS.CUENTA.ABIERTA}`);
      const cuentasCerradasRes = await fetch(`${API.CUENTAS}?estado=${ESTADOS.CUENTA.CERRADA}`);
      
      let todasCuentas: CuentaActiva[] = [];
      if (cuentasAbiertasRes.ok) {
        const abiertas = await cuentasAbiertasRes.json();
        todasCuentas = [...todasCuentas, ...(Array.isArray(abiertas) ? abiertas : [])];
      }
      if (cuentasCerradasRes.ok) {
        const cerradas = await cuentasCerradasRes.json();
        todasCuentas = [...todasCuentas, ...(Array.isArray(cerradas) ? cerradas : [])];
      }
      setCuentasActivas(todasCuentas);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('No se pudieron cargar las mesas');
    } finally {
      setLoading(false);
    }
  };

  // Verificar si una mesa tiene cuenta activa
  const mesaTieneCuentaActiva = (mesaNumero: number) => {
    return cuentasActivas.some(c => 
      c.mesa_numero === mesaNumero || c.mesa_numero === String(mesaNumero)
    );
  };

  const getCuentaActivaDeMesa = (mesaNumero: number) => {
    return cuentasActivas.find(c => 
      c.mesa_numero === mesaNumero || c.mesa_numero === String(mesaNumero)
    );
  };

  const handleMesaSelect = (mesa: Mesa) => {
    // Verificar si la mesa tiene cuenta activa
    if (mesaTieneCuentaActiva(mesa.numero)) {
      alert(`La Mesa ${mesa.numero} tiene una cuenta activa. Debe cerrarse y cobrarse primero.`);
      return;
    }
    
    localStorage.setItem('selectedMesa', JSON.stringify(mesa));
    router.push(PAGES.ATIENDEMESERO);
  };

  // Filtrar mesas: disponibles son las que NO tienen cuenta activa
  const mesasDisponibles = mesas.filter(m => 
    m.estado === 'disponible' && !mesaTieneCuentaActiva(m.numero)
  );
  
  // Mesas con cuenta activa (ocupadas por el sistema de cuentas)
  const mesasConCuenta = mesas.filter(m => mesaTieneCuentaActiva(m.numero));
  
  // Mesas ocupadas por otro motivo
  const mesasOcupadasOtro = mesas.filter(m => 
    m.estado === 'ocupada' && !mesaTieneCuentaActiva(m.numero)
  );

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800/95 backdrop-blur-md py-3 sm:py-4 md:py-6 px-3 sm:px-4 border-b border-gray-700">
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => router.push(PAGES.ATIENDEMESERO)}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 sm:w-5 h-4 sm:h-5" />
            <span className="hidden sm:inline">Volver</span>
            <span className="sm:hidden">←</span>
          </button>
          <div className="text-center flex-1">
            <Image
              src={IMAGES.LOGO}
              alt="Logo"
              width={60}
              height={60}
              className="mx-auto mb-1 sm:mb-2 drop-shadow-lg w-10 sm:w-12 md:w-16 h-10 sm:h-12 md:h-16"
              priority
            />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-0.5 sm:mb-1">Área Activa</h1>
            <p className="text-gray-400 text-xs sm:text-sm">Selecciona una mesa disponible</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">

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
                  <p className="text-gray-400 text-lg">Cargando mesas disponibles...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-400">
                <p className="mb-4">{error}</p>
                <button
                  onClick={fetchData}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reintentar
                </button>
              </div>
            ) : mesasDisponibles.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                {mesasDisponibles.map((mesa) => (
                  <motion.button
                    key={mesa.id}
                    whileHover={{ scale: 1.08, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleMesaSelect(mesa)}
                    className="relative group"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                    <div className="relative bg-gray-800 rounded-2xl p-3 sm:p-4 md:p-6 text-center hover:shadow-2xl transition duration-300 border border-emerald-500/30 group-hover:border-emerald-400">
                      <div className="flex items-center justify-center h-14 sm:h-16 md:h-20 mb-2 sm:mb-3 md:mb-4 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg">
                        <Utensils className="w-6 sm:w-7 md:w-10 h-6 sm:h-7 md:h-10 text-white" />
                      </div>
                      <div className="font-bold text-2xl sm:text-3xl md:text-4xl text-white mb-1 sm:mb-2">{mesa.numero}</div>
                      <div className="text-xs sm:text-sm md:text-sm text-gray-300 mb-1 sm:mb-2">
                        👥 {mesa.capacidad}
                      </div>
                      <div className="text-[10px] sm:text-xs md:text-xs text-emerald-300 font-semibold mb-2 sm:mb-3 line-clamp-1">
                        📍 {mesa.ubicacion}
                      </div>
                      <div className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 bg-emerald-500/20 text-emerald-300 text-[10px] sm:text-xs rounded-full font-bold border border-emerald-500/40">
                        ✓ Dispo
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

          {/* Mesas con Cuenta Activa - NO DISPONIBLES */}
          {mesasConCuenta.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-yellow-500/10 rounded-2xl p-6 border-2 border-orange-500/30"
            >
              <div className="flex items-center gap-3 mb-6">
                <Lock className="w-6 h-6 text-orange-400" />
                <h4 className="text-xl font-bold text-white">
                  Mesas con Cuenta Activa ({mesasConCuenta.length})
                </h4>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <p className="text-sm text-orange-200">
                  Estas mesas tienen una cuenta activa. Deben cerrarse y cobrarse para liberar la mesa.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
                {mesasConCuenta.map((mesa) => {
                  const cuenta = getCuentaActivaDeMesa(mesa.numero);
                  return (
                    <div
                      key={mesa.id}
                      className="relative bg-gray-800/60 rounded-xl p-3 sm:p-4 text-center border border-orange-500/30"
                    >
                      <div className="absolute -top-2 -right-2">
                        <Lock className="w-5 h-5 text-orange-400 bg-gray-800 rounded-full p-0.5" />
                      </div>
                      <div className="flex items-center justify-center h-12 sm:h-14 mb-2 bg-gradient-to-br from-orange-600/40 to-amber-600/40 rounded-lg">
                        <Utensils className="w-5 sm:w-6 h-5 sm:h-6 text-orange-300" />
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-white mb-1">{mesa.numero}</div>
                      <div className="text-[10px] sm:text-xs text-gray-400 mb-1">👥 {mesa.capacidad}</div>
                      {cuenta && (
                        <div className="text-[10px] sm:text-xs text-orange-300 bg-orange-500/20 px-2 py-0.5 rounded-full inline-block">
                          {cuenta.estado === ESTADOS.CUENTA.ABIERTA ? '🔓 Abierta' : '⏳ Por Cobrar'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Mesas Ocupadas - Otros */}
          {mesasOcupadasOtro.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700"
            >
              <h4 className="text-lg font-bold text-white mb-4">
                ⏳ Otras Mesas Ocupadas ({mesasOcupadasOtro.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
                {mesasOcupadasOtro.map((mesa) => (
                  <div
                    key={mesa.id}
                    className="bg-gray-700/30 rounded-lg p-2 sm:p-3 text-center opacity-50 border border-gray-600"
                  >
                    <div className="text-lg sm:text-2xl font-bold text-gray-400 mb-0.5 sm:mb-1">{mesa.numero}</div>
                    <div className="text-[10px] sm:text-xs text-gray-500">Ocupada</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 bg-gray-800/50 rounded-2xl p-3 sm:p-4 md:p-6 border border-gray-700">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-400 mb-0.5 sm:mb-1">
                {mesasDisponibles.length}
              </div>
              <div className="text-xs sm:text-sm md:text-sm text-gray-400">Disponibles</div>
            </div>
            <div className="text-center border-l border-gray-700">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-400 mb-0.5 sm:mb-1">
                {mesasConCuenta.length}
              </div>
              <div className="text-xs sm:text-sm md:text-sm text-gray-400">Con Cuenta</div>
            </div>
            <div className="text-center border-l border-gray-700">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-400 mb-0.5 sm:mb-1">
                {mesasOcupadasOtro.length}
              </div>
              <div className="text-xs sm:text-sm md:text-sm text-gray-400">Ocupadas</div>
            </div>
            <div className="text-center border-l border-gray-700">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-400 mb-0.5 sm:mb-1">
                {mesas.length}
              </div>
              <div className="text-xs sm:text-sm md:text-sm text-gray-400">Total</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
