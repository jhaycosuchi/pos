'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Package, Utensils } from 'lucide-react';
import { formatDateMexico } from '@/lib/dateUtils';

interface DetallePedido {
  nombre: string;
  cantidad: number;
  especificaciones: string;
  notas: string;
  es_restriccion: number;
}

interface Pedido {
  id: number;
  mesa_numero: number | null;
  es_para_llevar: number;
  numero_pedido: string;
  mesero_nombre: string;
  total: number;
  estado: string;
  creado_en: string;
  items: DetallePedido[];
}

interface PedidoDetailModalProps {
  isOpen: boolean;
  pedido: Pedido | null;
  onClose: () => void;
}

export default function PedidoDetailModal({ isOpen, pedido, onClose }: PedidoDetailModalProps) {
  if (!pedido) return null;

  const tiempoTranscurrido = () => {
    const ahora = new Date();
    const pedidoFecha = new Date(pedido.creado_en);
    const diferencia = Math.floor((ahora.getTime() - pedidoFecha.getTime()) / 60000);
    return diferencia;
  };

  const getColorEstado = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'preparando':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'listo':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'entregado':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
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
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="fixed inset-2 sm:inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-gray-900 rounded-lg sm:rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden max-h-[90vh] md:max-h-none"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-blue-500 flex-shrink-0">
              <h2 className="text-lg sm:text-2xl font-bold text-white">Detalles del Pedido</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Info Principal */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-gray-400 mb-1">Pedido</div>
                    <div className="font-mono text-sm sm:text-base text-white">{pedido.numero_pedido}</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-gray-400 mb-1">Mesero</div>
                    <div className="font-bold text-sm sm:text-base text-white">{pedido.mesero_nombre}</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-gray-400 mb-1">Tiempo</div>
                    <div className="font-bold text-sm sm:text-base text-white">{tiempoTranscurrido()}m</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-gray-400 mb-1">Total</div>
                    <div className="font-bold text-sm sm:text-base text-green-400">${pedido.total.toFixed(2)}</div>
                  </div>
                </div>

                {/* Tipo de Servicio y Estado */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-3 sm:p-4">
                    {pedido.es_para_llevar ? (
                      <>
                        <Package className="w-5 h-5 text-orange-400" />
                        <span className="text-sm sm:text-base text-white">Para Llevar</span>
                      </>
                    ) : (
                      <>
                        <Utensils className="w-5 h-5 text-blue-400" />
                        <span className="text-sm sm:text-base text-white">Mesa {pedido.mesa_numero}</span>
                      </>
                    )}
                  </div>
                  <div className={`flex items-center gap-2 rounded-lg p-3 sm:p-4 border ${getColorEstado(pedido.estado)}`}>
                    <Clock className="w-5 h-5" />
                    <span className="text-sm sm:text-base font-bold capitalize">{pedido.estado}</span>
                  </div>
                </div>

                {/* Items del Pedido */}
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Productos</h3>
                  <div className="space-y-2 sm:space-y-3">
                    {pedido.items && pedido.items.length > 0 ? (
                      pedido.items.map((item, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="bg-gray-800 rounded-lg p-3 sm:p-4 border-l-4 border-blue-500"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="font-bold text-base sm:text-lg text-white">
                                {item.cantidad}x {item.nombre}
                              </div>
                              {item.especificaciones && (
                                <div className="text-xs sm:text-sm text-gray-400 mt-1">
                                  Especificaciones: {item.especificaciones}
                                </div>
                              )}
                            </div>
                          </div>
                          {item.notas && (
                            <div className="text-xs sm:text-sm bg-blue-500/20 text-blue-300 px-2 sm:px-3 py-1 sm:py-1.5 rounded inline-flex items-center gap-1 mt-2">
                              📝 {item.notas}
                            </div>
                          )}
                          {item.es_restriccion === 1 && (
                            <div className="text-xs sm:text-sm bg-red-500/20 text-red-300 px-2 sm:px-3 py-1 sm:py-1.5 rounded inline-flex items-center gap-1 mt-2 ml-2">
                              ⚠️ Restricción
                            </div>
                          )}
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-gray-400 text-center py-6 sm:py-8">
                        No hay items en este pedido
                      </div>
                    )}
                  </div>
                </div>

                {/* Información Adicional */}
                <div className="bg-gray-800 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-gray-400">
                  <div className="flex items-center justify-between">
                    <span>Creado:</span>
                    <span>{formatDateMexico(pedido.creado_en)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-800 border-t border-gray-700 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base transition-all"
              >
                Cerrar
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
