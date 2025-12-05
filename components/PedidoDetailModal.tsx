'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Check, XCircle, Edit, Trash2, Package, DollarSign, Hash } from 'lucide-react';

interface PedidoCuenta {
  id: number;
  numero_pedido: string;
  es_para_llevar: number;
  estado: string;
  total: number;
  creado_en: string;
  items?: {
    nombre: string;
    cantidad: number;
    precio_unitario: number;
    notas?: string;
    especificaciones?: string;
  }[];
}

interface PedidoDetailModalProps {
  pedido: PedidoCuenta | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (type: 'editar' | 'eliminar') => Promise<void>;
  actionType: 'editar' | 'eliminar' | null;
  cuentaNumero?: string;
  mesaNumero?: string | number;
}

export default function PedidoDetailModal({
  pedido,
  isOpen,
  onClose,
  onConfirm,
  actionType,
  cuentaNumero,
  mesaNumero,
}: PedidoDetailModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionTaken, setActionTaken] = useState<'success' | 'error' | null>(null);

  if (!pedido || !actionType) return null;

  const isEdit = actionType === 'editar';
  const isDelete = actionType === 'eliminar';

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm(actionType);
      setActionTaken('success');
      setTimeout(() => {
        onClose();
        setActionTaken(null);
        setIsProcessing(false);
      }, 1500);
    } catch (error) {
      setActionTaken('error');
      setTimeout(() => {
        setIsProcessing(false);
        setActionTaken(null);
      }, 2000);
    }
  };

  const getTypeIcon = () => {
    if (isEdit) return <Edit className="w-6 h-6 text-blue-400" />;
    if (isDelete) return <Trash2 className="w-6 h-6 text-red-400" />;
    return <AlertCircle className="w-6 h-6 text-yellow-400" />;
  };

  const getTypeLabel = () => {
    if (isEdit) return 'Solicitud de Edición';
    if (isDelete) return 'Solicitud de Eliminación';
    return 'Solicitud';
  };

  const getTypeColor = () => {
    if (isEdit) return 'from-blue-800/40 to-blue-900/40 border-blue-600/40';
    if (isDelete) return 'from-red-800/40 to-red-900/40 border-red-600/40';
    return 'from-yellow-800/40 to-yellow-900/40 border-yellow-600/40';
  };

  const getActionDescription = () => {
    if (isEdit) return '¿Deseas enviar esta solicitud de edición? El mesero deberá aprobarla.';
    if (isDelete) return '¿Deseas enviar esta solicitud de eliminación? El mesero deberá aprobarla.';
    return 'Confirma la acción';
  };

  const getButtonLabel = () => {
    if (isEdit) return 'Enviar Edición';
    if (isDelete) return 'Solicitar Eliminación';
    return 'Confirmar';
  };

  const totalItems = pedido.items?.reduce((sum, item) => sum + item.cantidad, 0) || 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-2xl bg-gradient-to-br ${getTypeColor()} border-2 rounded-2xl shadow-2xl overflow-hidden`}
          >
            {/* HEADER */}
            <div className={`p-6 border-b border-white/10 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                {getTypeIcon()}
                <div>
                  <h2 className="text-lg font-bold text-white">{getTypeLabel()}</h2>
                  <p className="text-xs text-gray-400">Detalles completos del pedido</p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* CONTENT */}
            <div className="p-6 space-y-5 max-h-96 overflow-y-auto">
              {/* Información General */}
              <div className="bg-black/30 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Información del Pedido
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Número de Pedido</p>
                    <p className="text-white font-bold">{pedido.numero_pedido}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Cuenta</p>
                    <p className="text-white font-bold">{cuentaNumero || 'N/A'}</p>
                  </div>
                  {mesaNumero && mesaNumero !== 'PARA_LLEVAR' && (
                    <div>
                      <p className="text-xs text-gray-400">Mesa</p>
                      <p className="text-white font-bold">Mesa {mesaNumero}</p>
                    </div>
                  )}
                  {pedido.es_para_llevar === 1 && (
                    <div>
                      <p className="text-xs text-gray-400">Tipo</p>
                      <p className="text-white font-bold">Para Llevar</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-400">Total Items</p>
                    <p className="text-white font-bold">{totalItems} items</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="text-white font-bold text-lg">${pedido.total.toFixed(2)}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <p className="text-xs text-gray-400">Estado</p>
                  <p className="text-white font-semibold capitalize">{pedido.estado}</p>
                </div>
              </div>

              {/* Items del Pedido */}
              <div className="bg-black/30 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2 mb-3">
                  <Package className="w-4 h-4" />
                  Artículos ({pedido.items?.length || 0})
                </h3>

                {pedido.items && pedido.items.length > 0 ? (
                  <div className="space-y-2">
                    {pedido.items.map((item, idx) => (
                      <div key={idx} className="bg-black/50 rounded-lg p-3 border border-white/5">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="text-white font-medium">
                              <span className="text-blue-400 font-bold mr-2">{item.cantidad}x</span>
                              {item.nombre}
                            </p>
                            {(item.notas || item.especificaciones) && (
                              <p className="text-yellow-300 text-xs mt-1 italic">
                                📝 {item.notas || item.especificaciones}
                              </p>
                            )}
                          </div>
                          <span className="text-green-400 font-semibold ml-3">
                            ${(item.cantidad * item.precio_unitario).toFixed(2)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          Unitario: ${item.precio_unitario.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm italic">Sin detalles de items</p>
                )}
              </div>

              {/* Resumen de la Solicitud */}
              <div className="bg-black/30 rounded-xl p-4 border border-amber-500/20">
                <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  {isEdit ? 'Cambios Solicitados' : 'Eliminación'}
                </h3>

                <p className="text-sm text-gray-300">
                  {isEdit
                    ? '⚠️ Este pedido será marcado para edición. El mesero deberá revisar y aprobar los cambios.'
                    : '⚠️ Este pedido será marcado para eliminación. El mesero deberá revisar y aprobar la eliminación.'}
                </p>

                <p className="text-xs text-gray-400 mt-3">
                  {isEdit
                    ? 'Solicitante: Caja | Tipo: Edición'
                    : 'Solicitante: Caja | Tipo: Eliminación'}
                </p>
              </div>

              {/* Confirmación */}
              <div className="bg-black/30 rounded-xl p-4 border border-white/10">
                <p className="text-sm text-gray-300">{getActionDescription()}</p>
              </div>
            </div>

            {/* ACTION RESULT ANIMATION */}
            <AnimatePresence>
              {actionTaken && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`absolute inset-0 flex items-center justify-center ${
                    actionTaken === 'success'
                      ? 'bg-green-500/20 backdrop-blur-sm'
                      : 'bg-red-500/20 backdrop-blur-sm'
                  }`}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="text-center"
                  >
                    {actionTaken === 'success' ? (
                      <Check className="w-16 h-16 text-green-400 mx-auto" />
                    ) : (
                      <XCircle className="w-16 h-16 text-red-400 mx-auto" />
                    )}
                    <p className="text-white font-bold mt-3 text-lg">
                      {actionTaken === 'success' ? '¡Solicitud Enviada!' : '¡Error!'}
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* FOOTER - ACTION BUTTONS */}
            <div className="p-6 border-t border-white/10 flex gap-3">
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600/50 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-70"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={isProcessing}
                className={`flex-1 ${
                  isEdit
                    ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50'
                    : 'bg-red-600 hover:bg-red-700 disabled:bg-red-600/50'
                } text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70`}
              >
                {isProcessing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : isEdit ? (
                  <>
                    <Edit className="w-5 h-5" />
                    {getButtonLabel()}
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    {getButtonLabel()}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
