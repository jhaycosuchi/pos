'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, AlertTriangle, Save, DollarSign, ShoppingBag, Edit2 } from 'lucide-react';
import { useState } from 'react';

interface MenuItem {
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  especificaciones?: string;
  notas?: string;
  menu_item_id?: number;
}

interface PedidoEditarCompleto {
  id: number;
  numero_pedido: string;
  total: number;
  observaciones?: string;
  items?: MenuItem[];
}

interface CuentaInfo {
  numero_cuenta: string
  mesa_numero?: string | null
  [key: string]: any; // permitir otros campos
}

interface PedidoEditCompleteModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  pedido: PedidoEditarCompleto;
  cuenta: CuentaInfo;
  loading?: boolean;
}

export default function PedidoEditCompleteModal({
  show,
  onClose,
  onSave,
  pedido,
  cuenta,
  loading = false
}: PedidoEditCompleteModalProps) {
  const [items, setItems] = useState<MenuItem[]>(pedido.items || []);
  const [observaciones, setObservaciones] = useState(pedido.observaciones || '');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const total = items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);

  const handleAddItem = () => {
    setEditingIndex(-1);
    setEditingItem({
      nombre: '',
      cantidad: 1,
      precio_unitario: 0,
      especificaciones: '',
      notas: ''
    });
  };

  const handleEditItem = (index: number) => {
    setEditingIndex(index);
    setEditingItem({ ...items[index] });
  };

  const handleSaveItem = () => {
    if (!editingItem) return;

    const newErrors: string[] = [];
    if (!editingItem.nombre.trim()) newErrors.push('El nombre del producto es requerido');
    if (editingItem.cantidad < 1) newErrors.push('La cantidad debe ser mayor a 0');
    if (editingItem.precio_unitario < 0) newErrors.push('El precio no puede ser negativo');

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors([]);
    const newItems = [...items];
    if (editingIndex === -1) {
      newItems.push(editingItem);
    } else if (editingIndex !== null) {
      newItems[editingIndex] = editingItem;
    }
    setItems(newItems);
    setEditingIndex(null);
    setEditingItem(null);
  };

  const handleDeleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (items.length === 0) {
      setErrors(['Debe haber al menos un producto en el pedido']);
      return;
    }

    setErrors([]);
    await onSave({
      items,
      observaciones
    });
    onClose();
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
            className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-blue-600/50 flex flex-col"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-900/40 to-blue-800/40 border-b border-blue-600/50 px-6 py-4 flex justify-between items-center z-10">
              <div className="flex items-center gap-3">
                <Edit2 className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-bold text-white">
                  Editar Pedido {pedido.numero_pedido}
                </h2>
              </div>
              <button
                onClick={onClose}
                disabled={loading}
                className="p-1 hover:bg-blue-600/20 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Errores */}
              {errors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-900/30 border border-red-600/50 rounded-lg p-4"
                >
                  <p className="text-red-300 font-semibold flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    Errores:
                  </p>
                  <ul className="space-y-1">
                    {errors.map((error, idx) => (
                      <li key={idx} className="text-red-200 text-sm">• {error}</li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Información de Cuenta */}
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

              {/* Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-gray-400 text-sm font-semibold flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    Productos en el Pedido ({items.length})
                  </p>
                  <button
                    onClick={handleAddItem}
                    disabled={editingIndex !== null || loading}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar Producto
                  </button>
                </div>

                {/* Items List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {items.length === 0 ? (
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center">
                      <p className="text-gray-500 italic">No hay productos. Agrega uno para continuar.</p>
                    </div>
                  ) : (
                    items.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-blue-950/30 border border-blue-600/30 rounded-lg p-4 hover:bg-blue-950/50 transition-colors"
                      >
                        {editingIndex === idx ? (
                          <ItemEditForm
                            item={editingItem!}
                            onChange={setEditingItem}
                            onSave={handleSaveItem}
                            onCancel={() => {
                              setEditingIndex(null);
                              setEditingItem(null);
                            }}
                          />
                        ) : (
                          <div className="space-y-3">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <p className="text-white font-semibold text-lg">
                                  <span className="text-blue-400">{item.cantidad}x</span> {item.nombre}
                                </p>
                                <p className="text-gray-400 text-sm">
                                  ${item.precio_unitario.toFixed(2)} c/u
                                </p>
                                {(item.especificaciones || item.notas) && (
                                  <div className="mt-2 bg-yellow-500/10 border border-yellow-600/30 rounded px-2 py-1">
                                    {item.especificaciones && (
                                      <p className="text-yellow-300 text-xs">
                                        📝 <strong>Especificaciones:</strong> {item.especificaciones}
                                      </p>
                                    )}
                                    {item.notas && (
                                      <p className="text-yellow-200 text-xs">
                                        📌 <strong>Notas:</strong> {item.notas}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="text-right space-y-2">
                                <p className="text-blue-400 font-bold text-lg">
                                  ${(item.cantidad * item.precio_unitario).toFixed(2)}
                                </p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEditItem(idx)}
                                    disabled={editingIndex !== null || loading}
                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors disabled:opacity-50"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => handleDeleteItem(idx)}
                                    disabled={editingIndex !== null || loading}
                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors disabled:opacity-50"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}

                  {/* Nuevo Item Form */}
                  {editingIndex === -1 && editingItem && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-green-950/30 border border-green-600/30 rounded-lg p-4"
                    >
                      <ItemEditForm
                        item={editingItem}
                        onChange={setEditingItem}
                        onSave={handleSaveItem}
                        onCancel={() => {
                          setEditingIndex(null);
                          setEditingItem(null);
                        }}
                      />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-gray-400 text-sm font-semibold mb-2">
                  📝 Observaciones / Notas Adicionales
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  disabled={loading || editingIndex !== null}
                  placeholder="Ej: Sin cebolla, picante extra, etc."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:border-blue-600 focus:outline-none disabled:opacity-50"
                  rows={3}
                />
              </div>

              {/* Total */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-900/40 to-blue-800/40 border border-blue-600/50 rounded-lg p-4"
              >
                <p className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Total del Pedido
                </p>
                <p className="text-4xl font-black text-blue-400">
                  ${total.toFixed(2)}
                </p>
              </motion.div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={onClose}
                disabled={loading || editingIndex !== null}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading || editingIndex !== null}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function ItemEditForm({
  item,
  onChange,
  onSave,
  onCancel
}: {
  item: MenuItem;
  onChange: (item: MenuItem) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-gray-400 text-sm mb-1">Nombre del Producto*</label>
        <input
          type="text"
          value={item.nombre}
          onChange={(e) => onChange({ ...item, nombre: e.target.value })}
          placeholder="Ej: Rollo Yokoi"
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-400 text-sm mb-1">Cantidad*</label>
          <input
            type="number"
            min="1"
            value={item.cantidad}
            onChange={(e) => onChange({ ...item, cantidad: parseInt(e.target.value) || 1 })}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-1">Precio Unitario*</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={item.precio_unitario}
            onChange={(e) => onChange({ ...item, precio_unitario: parseFloat(e.target.value) || 0 })}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-gray-400 text-sm mb-1">Especificaciones</label>
        <input
          type="text"
          value={item.especificaciones || ''}
          onChange={(e) => onChange({ ...item, especificaciones: e.target.value })}
          placeholder="Ej: Sin picante, con extra queso"
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-gray-400 text-sm mb-1">Notas</label>
        <input
          type="text"
          value={item.notas || ''}
          onChange={(e) => onChange({ ...item, notas: e.target.value })}
          placeholder="Notas adicionales"
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onSave}
          className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded transition-colors"
        >
          Guardar Item
        </button>
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
