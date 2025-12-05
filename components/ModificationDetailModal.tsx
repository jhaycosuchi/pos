'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Check, XCircle, Edit, Trash2, Clock, User, Hash, Package } from 'lucide-react';

interface ModificacionPendiente {
  id: number;
  tipo: string;
  pedido_id: number;
  cuenta_id: number;
  solicitado_por: string;
  detalles: string;
  cambios: string;
  estado: string;
  fecha_solicitud: string;
  pedido_numero: string;
  cuenta_numero: string;
  mesa_numero?: string;
  mesero_nombre: string;
  producto_nombre?: string;
}

interface ModificationDetailModalProps {
  modificacion: ModificacionPendiente | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: number) => Promise<void>;
  onReject: (id: number) => Promise<void>;
}

export default function ModificationDetailModal({
  modificacion,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: ModificationDetailModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionTaken, setActionTaken] = useState<'approve' | 'reject' | null>(null);

  if (!modificacion) return null;

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove(modificacion.id);
      setActionTaken('approve');
      setTimeout(() => {
        onClose();
        setActionTaken(null);
        setIsProcessing(false);
      }, 1500);
    } catch (error) {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await onReject(modificacion.id);
      setActionTaken('reject');
      setTimeout(() => {
        onClose();
        setActionTaken(null);
        setIsProcessing(false);
      }, 1500);
    } catch (error) {
      setIsProcessing(false);
    }
  };

  const isEdition = modificacion.tipo === 'edicion';
  const isElimination = modificacion.tipo === 'eliminacion';

  const getTypeIcon = () => {
    if (isEdition) return <Edit className="w-6 h-6 text-blue-400" />;
    if (isElimination) return <Trash2 className="w-6 h-6 text-red-400" />;
    return <AlertCircle className="w-6 h-6 text-yellow-400" />;
  };

  const getTypeLabel = () => {
    if (isEdition) return 'Solicitud de Edición';
    if (isElimination) return 'Solicitud de Eliminación';
    return 'Modificación Pendiente';
  };

  const getTypeColor = () => {
    if (isEdition) return 'from-blue-800/40 to-blue-900/40 border-blue-600/40';
    if (isElimination) return 'from-red-800/40 to-red-900/40 border-red-600/40';
    return 'from-yellow-800/40 to-yellow-900/40 border-yellow-600/40';
  };

  const getActionButtonColors = () => {
    if (isEdition) return {
      bg: 'bg-blue-600 hover:bg-blue-700',
      text: 'text-blue-200'
    };
    if (isElimination) return {
      bg: 'bg-red-600 hover:bg-red-700',
      text: 'text-red-200'
    };
    return {
      bg: 'bg-yellow-600 hover:bg-yellow-700',
      text: 'text-yellow-200'
    };
  };

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
            className={`w-full max-w-md bg-gradient-to-br ${getTypeColor()} border-2 rounded-2xl shadow-2xl overflow-hidden`}
          >
            {/* HEADER */}
            <div className={`p-6 border-b border-white/10 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                {getTypeIcon()}
                <div>
                  <h2 className="text-lg font-bold text-white">{getTypeLabel()}</h2>
                  <p className="text-xs text-gray-400">Solicitud pendiente de aprobación</p>
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
            <div className="p-6 space-y-5">
              {/* Account & Order Info */}
              <div className="bg-black/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Hash className="w-4 h-4 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-gray-400">Cuenta</p>
                    <p className="text-white font-bold">{modificacion.cuenta_numero}</p>
                  </div>
                </div>
                <div className="border-t border-white/10 pt-3 flex items-center gap-3 text-sm">
                  <Hash className="w-4 h-4 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-gray-400">Pedido</p>
                    <p className="text-white font-bold">{modificacion.pedido_numero}</p>
                  </div>
                </div>
                {modificacion.mesa_numero && (
                  <div className="border-t border-white/10 pt-3 flex items-center gap-3 text-sm">
                    <Package className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-gray-400">Mesa</p>
                      <p className="text-white font-bold">{modificacion.mesa_numero}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="bg-black/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <p className="text-sm font-semibold text-gray-300">Detalles de la Solicitud</p>
                </div>
                <p className="text-sm text-gray-300 bg-black/50 rounded-lg p-3 border border-white/5">
                  {modificacion.detalles}
                </p>
                {modificacion.cambios && (
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Cambios propuestos:</p>
                    <p className="text-sm text-gray-300 bg-black/50 rounded-lg p-3 border border-white/5">
                      {modificacion.cambios}
                    </p>
                  </div>
                )}
              </div>

              {/* Request Info */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-black/30 rounded-lg p-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-gray-400">Solicitado por</p>
                    <p className="text-white font-semibold truncate">{modificacion.solicitado_por}</p>
                  </div>
                </div>
                <div className="bg-black/30 rounded-lg p-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-gray-400">Fecha</p>
                    <p className="text-white font-semibold">
                      {new Date(modificacion.fecha_solicitud).toLocaleTimeString('es-MX', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
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
                    actionTaken === 'approve'
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
                    {actionTaken === 'approve' ? (
                      <Check className="w-16 h-16 text-green-400 mx-auto" />
                    ) : (
                      <XCircle className="w-16 h-16 text-red-400 mx-auto" />
                    )}
                    <p className="text-white font-bold mt-3 text-lg">
                      {actionTaken === 'approve'
                        ? '¡Aprobado!'
                        : '¡Rechazado!'}
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* FOOTER - ACTION BUTTONS */}
            <div className="p-6 border-t border-white/10 flex gap-3">
              <button
                onClick={handleReject}
                disabled={isProcessing}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isProcessing && actionTaken === 'reject' ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
                Rechazar
              </button>
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isProcessing && actionTaken === 'approve' ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <Check className="w-5 h-5" />
                )}
                Aprobar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
