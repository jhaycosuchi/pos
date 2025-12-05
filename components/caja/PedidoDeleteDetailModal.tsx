'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, X, AlertTriangle, DollarSign, ShoppingBag } from 'lucide-react';

interface Item {
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  notas?: string;
  especificaciones?: string;
}

interface PedidoDeleteDetailModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  pedido: {
    numero_pedido: string;
    total: number;
    items?: Item[];
  };
  cuenta: {
    numero_cuenta: string;
    mesa_numero?: string | null;
  };
  loading?: boolean;
}

export default function PedidoDeleteDetailModal({
  show,
  onClose,
  onConfirm,
  pedido,
  cuenta,
  loading = false
}: PedidoDeleteDetailModalProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-red-600/50"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-red-900/40 to-red-800/40 border-b border-red-600/50 px-6 py-4 flex justify-between items-center z-10">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <h2 className="text-xl font-bold text-white">Eliminar Pedido</h2>
              </div>
              <button
                onClick={onClose}
                disabled={loading}
                className="p-1 hover:bg-red-600/20 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Cuenta Info */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-2">Información de la Cuenta</p>
                <div className="space-y-2">
                  <p className="text-white font-semibold">
                    <span className="text-blue-400">Cuenta:</span> {cuenta.numero_cuenta}
                  </p>
                  {cuenta.mesa_numero && cuenta.mesa_numero !== 'PARA_LLEVAR' && (
                    <p className="text-white font-semibold">
                      <span className="text-blue-400">Mesa:</span> {cuenta.mesa_numero}
                    </p>
                  )}
                  {cuenta.mesa_numero === 'PARA_LLEVAR' && (
                    <p className="text-white font-semibold">
                      <span className="text-purple-400">🛒 Para Llevar</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Pedido Info */}
              <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-2">Pedido a Eliminar</p>
                <p className="text-white font-bold text-lg">
                  Pedido: <span className="text-red-400">{pedido.numero_pedido}</span>
                </p>
              </div>

              {/* Items Detalle */}
              {pedido.items && pedido.items.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-gray-400 text-sm font-semibold mb-3 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    Productos a Eliminar ({pedido.items.length})
                  </p>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {pedido.items.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-red-950/30 border border-red-600/30 rounded-lg p-3 hover:bg-red-950/50 transition-colors"
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="text-red-400 font-bold text-lg">{item.cantidad}x</span>
                              <p className="text-white font-semibold truncate">
                                {item.nombre}
                              </p>
                            </div>

                            {/* Precio unitario */}
                            <p className="text-gray-400 text-sm">
                              ${item.precio_unitario.toFixed(2)} c/u
                            </p>

                            {/* Notas/Especificaciones */}
                            {(item.notas || item.especificaciones) && (
                              <div className="mt-2 bg-yellow-500/10 border border-yellow-600/30 rounded px-2 py-1">
                                <p className="text-yellow-300 text-xs font-semibold">
                                  📝 Especiales:
                                </p>
                                <p className="text-yellow-200 text-xs italic">
                                  {item.notas || item.especificaciones}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Subtotal */}
                          <div className="text-right">
                            <p className="text-red-400 font-bold text-lg">
                              ${(item.cantidad * item.precio_unitario).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
                  <p className="text-gray-500 italic">Sin detalles de items disponibles</p>
                </div>
              )}

              {/* Total */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-red-900/40 to-red-800/40 border border-red-600/50 rounded-lg p-4"
              >
                <p className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Total del Pedido a Eliminar
                </p>
                <p className="text-4xl font-black text-red-400">
                  ${pedido.total.toFixed(2)}
                </p>
              </motion.div>

              {/* Warning */}
              <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-3">
                <p className="text-red-300 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Atención:</strong> Esta acción solicitará la eliminación del pedido y sus items. El pedido se eliminarán definitivamente del sistema.
                  </span>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                {loading ? 'Eliminando...' : 'Confirmar Eliminación'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
