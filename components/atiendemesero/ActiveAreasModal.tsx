'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, DollarSign, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { API, PAGES } from '@/lib/config';

interface Mesa {
  id: number;
  numero: string;
  capacidad: number;
  estado: string;
  mesero_id: number | null;
}

interface ActiveAreasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ActiveAreasModal({ isOpen, onClose }: ActiveAreasModalProps) {
  const [activeMesas, setActiveMesas] = useState<Mesa[]>([]);
  const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'payment' | 'menu'>('list');
  const router = useRouter();

  const fetchActiveMesas = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API.MESAS}?estado=ocupada`);
      const data = await res.json();
      setActiveMesas(data || []);
    } catch (error) {
      console.error('Error fetching active mesas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchActiveMesas();
    }
  }, [isOpen]);

  const handleCloseMesa = async (mesa: Mesa, method: 'cash' | 'card') => {
    try {
      const res = await fetch(API.MESA_BY_ID(mesa.id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          estado: 'disponible',
          pagado_con: method,
          total: total
        })
      });
      
      if (res.ok) {
        setSelectedMesa(null);
        setTotal(0);
        setPaymentMethod(null);
        // Recargar lista de mesas después de un pequeño delay
        setTimeout(() => {
          fetchActiveMesas();
        }, 500);
      } else {
        alert('Error al cerrar la mesa');
      }
    } catch (error) {
      console.error('Error closing mesa:', error);
      alert('Error al cerrar la mesa');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-2 sm:inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-5xl bg-gray-900 rounded-lg sm:rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-blue-500">
              <h2 className="text-lg sm:text-2xl font-bold text-white">Áreas Activas - Cierre de Cuenta</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full min-h-64">
                  <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
                </div>
              ) : activeMesas.length === 0 ? (
                <div className="flex items-center justify-center h-full min-h-64">
                  <div className="text-center px-4">
                    <p className="text-gray-400 text-base sm:text-lg">No hay mesas activas</p>
                  </div>
                </div>
              ) : !selectedMesa ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 md:p-6">
                  {activeMesas.map(mesa => (
                    <div key={mesa.id} className="flex flex-col gap-2">
                      {/* Card Principal */}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl text-center font-bold transition-all shadow-lg hover:shadow-xl"
                      >
                        <div className="text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2">🍽️</div>
                        <div className="text-sm sm:text-base md:text-lg">Mesa {mesa.numero}</div>
                        <div className="text-xs sm:text-sm text-blue-200 mt-0.5 sm:mt-1">Cap. {mesa.capacidad}</div>
                      </motion.div>
                      
                      {/* Botones de Acción */}
                      <div className="grid grid-cols-2 gap-1 sm:gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            localStorage.setItem('selectedMesa', JSON.stringify(mesa));
                            onClose();
                            router.push(PAGES.ATIENDEMESERO);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm p-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1"
                        >
                          <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Agregar</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedMesa(mesa)}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs sm:text-sm p-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1"
                        >
                          <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Cobrar</span>
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 sm:p-4 md:p-6 flex flex-col h-full">
                  {/* Mesa Details */}
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
                      Mesa {selectedMesa.numero}
                    </h3>
                    
                    {/* Total Input */}
                    <div className="bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
                      <label className="block text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3">Total a Cobrar</label>
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <button
                          onClick={() => setTotal(Math.max(0, total - 5))}
                          className="bg-red-600 hover:bg-red-700 p-2 sm:p-3 rounded-lg text-white transition-colors flex-shrink-0"
                        >
                          <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <input
                          type="number"
                          value={total}
                          onChange={(e) => setTotal(parseFloat(e.target.value) || 0)}
                          className="flex-1 bg-gray-700 text-white text-2xl sm:text-3xl font-bold px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-center"
                          placeholder="0.00"
                          step="0.10"
                        />
                        <button
                          onClick={() => setTotal(total + 5)}
                          className="bg-green-600 hover:bg-green-700 p-2 sm:p-3 rounded-lg text-white transition-colors flex-shrink-0"
                        >
                          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                      <div className="text-3xl sm:text-4xl font-bold text-white text-center">
                        ${total.toFixed(2)}
                      </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPaymentMethod('cash')}
                        className={`py-4 sm:py-5 md:py-6 px-3 sm:px-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all flex items-center justify-center gap-2 sm:gap-3 ${
                          paymentMethod === 'cash'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="hidden sm:inline">Efectivo</span>
                        <span className="sm:hidden">$</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPaymentMethod('card')}
                        className={`py-4 sm:py-5 md:py-6 px-3 sm:px-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all flex items-center justify-center gap-2 sm:gap-3 ${
                          paymentMethod === 'card'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="hidden sm:inline">Tarjeta</span>
                        <span className="sm:hidden">💳</span>
                      </motion.button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 sm:gap-3 mt-auto">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedMesa(null);
                        setTotal(0);
                        setPaymentMethod(null);
                      }}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 sm:py-4 px-3 sm:px-6 rounded-lg sm:rounded-xl font-bold text-sm sm:text-lg transition-colors"
                    >
                      Atrás
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (paymentMethod && total > 0) {
                          handleCloseMesa(selectedMesa, paymentMethod);
                        }
                      }}
                      disabled={!paymentMethod || total === 0}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-3 sm:py-4 px-3 sm:px-6 rounded-lg sm:rounded-xl font-bold text-sm sm:text-lg transition-all"
                    >
                      Cobrar ${total.toFixed(2)}
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
