'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Package, ChefHat } from 'lucide-react';
import { formatDateMexico, calcularTiempoTranscurrido } from '@/lib/dateUtils';

interface DetallePedido {
  nombre: string;
  cantidad: number;
  especificaciones: string;
  notas: string;
  es_restriccion: number;
  precio_unitario: number;
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

interface PedidoHistorialModalProps {
  isOpen: boolean;
  pedidos: Pedido[];
  onClose: () => void;
  titulo: string;
}

export function PedidoHistorialModal({
  isOpen,
  pedidos,
  onClose,
  titulo
}: PedidoHistorialModalProps) {
  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-red-100 text-red-800';
      case 'preparando':
        return 'bg-yellow-100 text-yellow-800';
      case 'listo':
        return 'bg-green-100 text-green-800';
      case 'entregado':
        return 'bg-blue-100 text-blue-800';
      case 'completado':
        return 'bg-purple-100 text-purple-800';
      case 'pagado':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl bg-white rounded-xl shadow-2xl z-50 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{titulo}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} en esta cuenta
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {pedidos.map((pedido) => (
                <div
                  key={pedido.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {/* Pedido Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 px-3 py-1 rounded font-mono text-sm font-bold text-gray-800">
                        {pedido.numero_pedido}
                      </div>
                      <div className={`px-3 py-1 rounded text-xs font-bold ${getEstadoBadgeColor(pedido.estado)}`}>
                        {pedido.estado.toUpperCase()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-green-600">${pedido.total.toFixed(2)}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {calcularTiempoTranscurrido(pedido.creado_en)}
                      </div>
                    </div>
                  </div>

                  {/* Información General */}
                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div>
                      <span className="text-gray-600">Mesero:</span>
                      <p className="font-semibold text-gray-900">{pedido.mesero_nombre}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Creado:</span>
                      <p className="font-semibold text-gray-900">{formatDateMexico(pedido.creado_en)}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="bg-gray-50 rounded p-3 mb-3">
                    <h4 className="font-semibold text-sm text-gray-900 mb-2 flex items-center gap-2">
                      <Package className="w-4 h-4" /> Productos ({pedido.items?.length || 0})
                    </h4>
                    <div className="space-y-1">
                      {pedido.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm text-gray-700">
                          <span>
                            <span className="font-bold text-gray-900">{item.cantidad}x</span> {item.nombre}
                            {item.notas && <span className="text-blue-600 text-xs ml-1">({item.notas})</span>}
                          </span>
                          <span className="text-gray-600">${(item.cantidad * item.precio_unitario).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200" />
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-lg font-bold transition-all"
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
