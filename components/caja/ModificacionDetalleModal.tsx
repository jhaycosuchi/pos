'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, XCircle, AlertTriangle, ArrowRight, Trash2, Plus, Edit2 } from 'lucide-react';
import { useState } from 'react';

interface ModificacionDetalle {
  id: number;
  tipo: string;
  pedido_numero: string;
  cuenta_numero: string;
  mesa_numero?: string;
  solicitado_por: string;
  cambios?: string;
  items_anteriores?: string;
  items_nuevos?: string;
  detalles: string;
  fecha_solicitud: string;
}

interface ModificacionDetalleModalProps {
  show: boolean;
  onClose: () => void;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
  modificacion: ModificacionDetalle;
  loading?: boolean;
}

export default function ModificacionDetalleModal({
  show,
  onClose,
  onApprove,
  onReject,
  modificacion,
  loading = false
}: ModificacionDetalleModalProps) {
  const [procesando, setProcesando] = useState(false);

  let cambiosData: any = {};
  let itemsAnteriores: any[] = [];
  let itemsNuevos: any[] = [];

  try {
    if (modificacion.cambios) {
      cambiosData = JSON.parse(modificacion.cambios);
      // Los items están embebidos en cambiosData
      itemsAnteriores = cambiosData.items_anteriores || [];
      itemsNuevos = cambiosData.items_nuevos || [];
    }
    // Fallback si están en campos separados
    if (modificacion.items_anteriores && !itemsAnteriores.length) {
      itemsAnteriores = JSON.parse(modificacion.items_anteriores);
    }
    if (modificacion.items_nuevos && !itemsNuevos.length) {
      itemsNuevos = JSON.parse(modificacion.items_nuevos);
    }
  } catch (e) {
    console.error('Error parsing JSON:', e);
  }

  const handleApprove = async () => {
    setProcesando(true);
    try {
      await onApprove();
    } catch (error) {
      console.error('Error al aprobar:', error);
    } finally {
      setProcesando(false);
    }
  };

  const handleReject = async () => {
    setProcesando(true);
    try {
      await onReject();
    } catch (error) {
      console.error('Error al rechazar:', error);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-purple-600/50 flex flex-col"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-900/40 to-purple-800/40 border-b border-purple-600/50 px-6 py-4 flex justify-between items-center z-10">
              <div className="flex items-center gap-3">
                <Edit2 className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-bold text-white">Solicitud de Modificación</h2>
              </div>
              <button
                onClick={onClose}
                disabled={procesando}
                className="p-1 hover:bg-purple-600/20 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Información de Cuenta y Pedido */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-2">Cuenta</p>
                  <p className="text-white font-bold text-lg">{modificacion.cuenta_numero}</p>
                  {modificacion.mesa_numero && modificacion.mesa_numero !== 'PARA_LLEVAR' && (
                    <p className="text-gray-400 text-sm mt-2">Mesa: {modificacion.mesa_numero}</p>
                  )}
                </div>
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-2">Pedido</p>
                  <p className="text-white font-bold text-lg">{modificacion.pedido_numero}</p>
                  <p className="text-gray-400 text-sm mt-2">Solicitado por: {modificacion.solicitado_por}</p>
                </div>
              </div>

              {/* Items Eliminados */}
              {cambiosData.items_eliminados && cambiosData.items_eliminados.length > 0 && (
                <div className="space-y-3">
                  <p className="text-red-400 font-semibold flex items-center gap-2">
                    <Trash2 className="w-5 h-5" />
                    Productos Eliminados ({cambiosData.items_eliminados.length})
                  </p>
                  <div className="space-y-2">
                    {cambiosData.items_eliminados.map((item: any, idx: number) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-red-950/30 border border-red-600/30 rounded-lg p-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-white font-semibold">
                              <span className="text-red-400">{item.cantidad}x</span> {item.nombre}
                            </p>
                            <p className="text-gray-400 text-sm">
                              ${item.precio_unitario.toFixed(2)} c/u = ${(item.cantidad * item.precio_unitario).toFixed(2)}
                            </p>
                            {(item.especificaciones || item.notas) && (
                              <p className="text-yellow-300 text-xs mt-1">
                                📝 {item.especificaciones || item.notas}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Items Agregados */}
              {cambiosData.items_agregados && cambiosData.items_agregados.length > 0 && (
                <div className="space-y-3">
                  <p className="text-green-400 font-semibold flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Productos Agregados ({cambiosData.items_agregados.length})
                  </p>
                  <div className="space-y-2">
                    {cambiosData.items_agregados.map((item: any, idx: number) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-green-950/30 border border-green-600/30 rounded-lg p-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-white font-semibold">
                              <span className="text-green-400">{item.cantidad}x</span> {item.nombre}
                            </p>
                            <p className="text-gray-400 text-sm">
                              ${item.precio_unitario.toFixed(2)} c/u = ${(item.cantidad * item.precio_unitario).toFixed(2)}
                            </p>
                            {(item.especificaciones || item.notas) && (
                              <p className="text-yellow-300 text-xs mt-1">
                                📝 {item.especificaciones || item.notas}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Items Modificados */}
              {cambiosData.items_modificados && cambiosData.items_modificados.length > 0 && (
                <div className="space-y-3">
                  <p className="text-blue-400 font-semibold flex items-center gap-2">
                    <Edit2 className="w-5 h-5" />
                    Productos Modificados ({cambiosData.items_modificados.length})
                  </p>
                  <div className="space-y-3">
                    {cambiosData.items_modificados.map((mod: any, idx: number) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-blue-950/30 border border-blue-600/30 rounded-lg p-4"
                      >
                        <p className="text-white font-semibold mb-3">{mod.nombre}</p>

                        <div className="space-y-2">
                          {/* Cantidad */}
                          {mod.anterior.cantidad !== mod.nuevo.cantidad && (
                            <div className="flex items-center justify-between">
                              <div className="bg-red-900/20 border border-red-600/30 rounded px-3 py-2 flex-1">
                                <p className="text-gray-400 text-xs mb-1">Cantidad Anterior</p>
                                <p className="text-white font-semibold">{mod.anterior.cantidad}x</p>
                              </div>
                              <ArrowRight className="w-5 h-5 text-gray-400 mx-2" />
                              <div className="bg-green-900/20 border border-green-600/30 rounded px-3 py-2 flex-1">
                                <p className="text-gray-400 text-xs mb-1">Cantidad Nueva</p>
                                <p className="text-white font-semibold">{mod.nuevo.cantidad}x</p>
                              </div>
                            </div>
                          )}

                          {/* Precio */}
                          {mod.anterior.precio_unitario !== mod.nuevo.precio_unitario && (
                            <div className="flex items-center justify-between">
                              <div className="bg-red-900/20 border border-red-600/30 rounded px-3 py-2 flex-1">
                                <p className="text-gray-400 text-xs mb-1">Precio Anterior</p>
                                <p className="text-white font-semibold">${mod.anterior.precio_unitario.toFixed(2)}</p>
                              </div>
                              <ArrowRight className="w-5 h-5 text-gray-400 mx-2" />
                              <div className="bg-green-900/20 border border-green-600/30 rounded px-3 py-2 flex-1">
                                <p className="text-gray-400 text-xs mb-1">Precio Nuevo</p>
                                <p className="text-white font-semibold">${mod.nuevo.precio_unitario.toFixed(2)}</p>
                              </div>
                            </div>
                          )}

                          {/* Especificaciones */}
                          {mod.anterior.especificaciones !== mod.nuevo.especificaciones && (
                            <div className="flex items-start justify-between">
                              <div className="bg-red-900/20 border border-red-600/30 rounded px-3 py-2 flex-1">
                                <p className="text-gray-400 text-xs mb-1">Especificaciones Anteriores</p>
                                <p className="text-white text-sm">{mod.anterior.especificaciones || 'Ninguna'}</p>
                              </div>
                              <ArrowRight className="w-5 h-5 text-gray-400 mx-2 mt-2" />
                              <div className="bg-green-900/20 border border-green-600/30 rounded px-3 py-2 flex-1">
                                <p className="text-gray-400 text-xs mb-1">Especificaciones Nuevas</p>
                                <p className="text-white text-sm">{mod.nuevo.especificaciones || 'Ninguna'}</p>
                              </div>
                            </div>
                          )}

                          {/* Notas */}
                          {mod.anterior.notas !== mod.nuevo.notas && (
                            <div className="flex items-start justify-between">
                              <div className="bg-red-900/20 border border-red-600/30 rounded px-3 py-2 flex-1">
                                <p className="text-gray-400 text-xs mb-1">Notas Anteriores</p>
                                <p className="text-white text-sm">{mod.anterior.notas || 'Ninguna'}</p>
                              </div>
                              <ArrowRight className="w-5 h-5 text-gray-400 mx-2 mt-2" />
                              <div className="bg-green-900/20 border border-green-600/30 rounded px-3 py-2 flex-1">
                                <p className="text-gray-400 text-xs mb-1">Notas Nuevas</p>
                                <p className="text-white text-sm">{mod.nuevo.notas || 'Ninguna'}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Subtotal cambio */}
                        {(mod.anterior.cantidad !== mod.nuevo.cantidad || mod.anterior.precio_unitario !== mod.nuevo.precio_unitario) && (
                          <div className="mt-3 pt-3 border-t border-blue-600/30 flex justify-between items-center">
                            <span className="text-gray-400">Subtotal:</span>
                            <div className="flex items-center gap-3">
                              <span className="text-red-400 font-semibold">
                                ${(mod.anterior.cantidad * mod.anterior.precio_unitario).toFixed(2)}
                              </span>
                              <ArrowRight className="w-4 h-4 text-gray-400" />
                              <span className="text-green-400 font-semibold">
                                ${(mod.nuevo.cantidad * mod.nuevo.precio_unitario).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sin cambios */}
              {(!cambiosData.items_eliminados || cambiosData.items_eliminados.length === 0) &&
                (!cambiosData.items_agregados || cambiosData.items_agregados.length === 0) &&
                (!cambiosData.items_modificados || cambiosData.items_modificados.length === 0) && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center">
                  <p className="text-gray-500 italic">No hay cambios registrados</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={onClose}
                disabled={procesando}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                Cerrar
              </button>
              <button
                onClick={handleReject}
                disabled={procesando}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                {procesando ? 'Rechazando...' : 'Rechazar'}
              </button>
              <button
                onClick={handleApprove}
                disabled={procesando}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                {procesando ? 'Aprobando...' : 'Aprobar'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
