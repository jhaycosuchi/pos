'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PlusIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

interface MenuItem {
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  categoria?: string;
}

interface ProductModalProps {
  product: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: MenuItem, notes: string[], customNote: string) => void;
}

const NOTAS_PREDEFINIDAS = [
  'Sin chile',
  'Sin picante',
  'Sin cebolla',
  'Sin cilantro',
  'Sin wasabi',
  'Sin jengibre',
  'Sin salsa',
  'Sin queso',
  'Sin aguacate',
  'Extra picante',
  'Bien cocido',
  'Poco cocido',
];

export default function ProductModal({ product, isOpen, onClose, onAddToCart }: ProductModalProps) {
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [customNote, setCustomNote] = useState('');

  const toggleNote = (note: string) => {
    setSelectedNotes(prev => 
      prev.includes(note) 
        ? prev.filter(n => n !== note)
        : [...prev, note]
    );
  };

  const handleAdd = () => {
    if (product) {
      onAddToCart(product, selectedNotes, customNote);
      setSelectedNotes([]);
      setCustomNote('');
    }
  };

  const handleClose = () => {
    setSelectedNotes([]);
    setCustomNote('');
    onClose();
  };

  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-gray-800 w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Product Header */}
            <div className="relative h-48 sm:h-56">
              <Image
                src={product.imagen_url || '/images/menu/placeholder.svg'}
                alt={product.nombre}
                fill
                sizes="(max-width: 768px) 100vw, 512px"
                className="object-cover"
                priority
                quality={90}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('placeholder.svg')) {
                    target.src = '/images/menu/placeholder.svg';
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-800 to-transparent" />
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm"
              >
                <XMarkIcon className="w-6 h-6 text-white" />
              </button>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-xl sm:text-2xl font-bold text-white">{product.nombre}</h3>
                <p className="text-orange-400 font-bold text-lg sm:text-xl">${product.precio}</p>
              </div>
            </div>

            {/* Notes Section */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <PencilSquareIcon className="w-5 h-5 text-orange-400" />
                Notas del producto
              </h4>

              {/* Predefined Notes */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                {NOTAS_PREDEFINIDAS.map(nota => (
                  <button
                    key={nota}
                    onClick={() => toggleNote(nota)}
                    className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                      selectedNotes.includes(nota)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {nota}
                  </button>
                ))}
              </div>

              {/* Custom Note */}
              <div className="mt-4">
                <label className="block text-sm text-gray-400 mb-2">Nota adicional:</label>
                <textarea
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Escribe una nota especial..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl p-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={2}
                />
              </div>

              {/* Selected Notes Preview */}
              {(selectedNotes.length > 0 || customNote) && (
                <div className="mt-4 p-3 bg-gray-700/50 rounded-xl">
                  <p className="text-sm text-gray-400 mb-1">Notas seleccionadas:</p>
                  <p className="text-sm text-orange-400">
                    {[...selectedNotes, customNote].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}
            </div>

            {/* Add Button */}
            <div className="p-4 sm:p-6 border-t border-gray-700">
              <button
                onClick={handleAdd}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 rounded-xl text-lg transition-all flex items-center justify-center gap-3"
              >
                <PlusIcon className="w-6 h-6" />
                Agregar al Carrito
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}