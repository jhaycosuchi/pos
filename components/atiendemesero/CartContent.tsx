'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { TrashIcon, MinusIcon, PlusIcon, PaperAirplaneIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

interface MenuItem {
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  categoria?: string;
}

interface CartItem {
  id: string;
  item: MenuItem;
  quantity: number;
  options: {
    notas: string[];
    notaPersonalizada: string;
  };
}

interface CartContentProps {
  cart: CartItem[];
  total: number;
  itemCount: number;
  tableNumber: string;
  isParaLlevar: boolean;
  sending: boolean;
  observaciones: string;
  onObservacionesChange: (observaciones: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  sendOrder: () => void;
  getNotasText: (options: { notas: string[]; notaPersonalizada: string }) => string;
  clearCart: () => void;
}

export default function CartContent({
  cart,
  total,
  itemCount,
  tableNumber,
  isParaLlevar,
  sending,
  observaciones,
  onObservacionesChange,
  updateQuantity,
  removeFromCart,
  sendOrder,
  getNotasText,
  clearCart
}: CartContentProps) {
  return (
    <>
      <div className="px-4 sm:px-6 py-2 sm:py-3 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold">Tu Orden</h2>
          <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs sm:text-sm ${
            isParaLlevar ? 'bg-green-500/20' : 'bg-blue-500/20'
          }`}>
            <span className={`font-medium ${isParaLlevar ? 'text-green-400' : 'text-blue-400'}`}>
              {isParaLlevar ? '📦' : `🍽️ ${tableNumber}`}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 sm:py-3 space-y-2">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-6">
            <ShoppingCartIcon className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-sm font-medium">Carrito vacio</p>
            <p className="text-xs text-gray-500">Agrega productos</p>
          </div>
        ) : (
          cart.map((cartItem) => {
            const notas = getNotasText(cartItem.options);
            return (
              <motion.div
                key={cartItem.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-gray-700/50 rounded-lg p-2 sm:p-3"
              >
                <div className="flex gap-2">
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={cartItem.item.imagen_url || '/images/menu/placeholder.svg'}
                      alt={cartItem.item.nombre}
                      fill
                      sizes="64px"
                      className="object-cover"
                      quality={75}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes('placeholder.svg')) {
                          target.src = '/images/menu/placeholder.svg';
                        }
                      }}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-semibold text-xs sm:text-sm truncate">{cartItem.item.nombre}</h4>
                      <button
                        onClick={() => removeFromCart(cartItem.id)}
                        className="p-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/40 flex-shrink-0"
                      >
                        <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                    
                    {/* Mostrar notas si existen */}
                    {notas && (
                      <p className="text-[10px] sm:text-xs text-orange-300 mt-0.5 line-clamp-1">📝 {notas}</p>
                    )}
                    
                    <p className="text-orange-400 font-bold text-xs sm:text-sm mt-1">
                      ${(cartItem.item.precio * cartItem.quantity).toFixed(2)}
                    </p>
                    
                    <div className="flex items-center gap-1 mt-1">
                      <button
                        onClick={() => updateQuantity(cartItem.id, -1)}
                        className="w-6 h-6 sm:w-7 sm:h-7 bg-gray-600 hover:bg-gray-500 rounded-lg flex items-center justify-center text-xs sm:text-sm"
                      >
                        <MinusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <span className="w-6 text-center font-bold text-xs sm:text-sm">{cartItem.quantity}</span>
                      <button
                        onClick={() => updateQuantity(cartItem.id, 1)}
                        className="w-6 h-6 sm:w-7 sm:h-7 bg-orange-500 hover:bg-orange-600 rounded-lg flex items-center justify-center text-xs sm:text-sm"
                      >
                        <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <div className="px-3 sm:px-4 py-2 sm:py-3 border-t border-gray-700 space-y-3 bg-gray-800 flex-shrink-0">
        <div className="bg-gray-700/50 rounded-lg p-3 space-y-1">
          <div className="flex justify-between text-xs sm:text-sm text-gray-400">
            <span>Productos</span>
            <span>{itemCount}</span>
          </div>
          <div className="flex justify-between text-lg sm:text-xl font-bold">
            <span>Total</span>
            <span className="text-orange-400">${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs sm:text-sm font-medium text-gray-300">
            📝 Instrucciones (opcional)
          </label>
          <textarea
            value={observaciones}
            onChange={(e) => onObservacionesChange(e.target.value)}
            placeholder="Ej: Sin picante, Extra salsa..."
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-700 text-white border border-gray-600 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs sm:text-sm resize-none"
            rows={2}
          />
        </div>

        <button
          onClick={sendOrder}
          disabled={sending || cart.length === 0}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 sm:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base transition-all flex items-center justify-center gap-2 sm:gap-3"
        >
          {sending ? (
            <>
              <div className="animate-spin w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full" />
              <span>Enviando...</span>
            </>
          ) : (
            <>
              <PaperAirplaneIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Enviar Orden</span>
            </>
          )}
        </button>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="w-full py-2 sm:py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-lg sm:rounded-lg transition-all text-xs sm:text-sm"
          >
            Limpiar Carrito
          </button>
        )}
      </div>
    </>
  );
}