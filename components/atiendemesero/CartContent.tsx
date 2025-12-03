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
  updateQuantity,
  removeFromCart,
  sendOrder,
  getNotasText,
  clearCart
}: CartContentProps) {
  return (
    <>
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold">Tu Orden</h2>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
            isParaLlevar ? 'bg-green-500/20' : 'bg-blue-500/20'
          }`}>
            <span className={`font-medium text-sm ${isParaLlevar ? 'text-green-400' : 'text-blue-400'}`}>
              {isParaLlevar ? '📦 Para Llevar' : `🍽️ Mesa ${tableNumber}`}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8">
            <ShoppingCartIcon className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">Carrito vacio</p>
            <p className="text-sm">Agrega productos para comenzar</p>
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
                className="bg-gray-700/50 rounded-xl p-3 sm:p-4"
              >
                <div className="flex gap-3">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={cartItem.item.imagen_url || '/images/menu/placeholder.svg'}
                      alt={cartItem.item.nombre}
                      fill
                      sizes="80px"
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
                      <h4 className="font-semibold text-sm sm:text-base truncate">{cartItem.item.nombre}</h4>
                      <button
                        onClick={() => removeFromCart(cartItem.id)}
                        className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/40 flex-shrink-0"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Mostrar notas si existen */}
                    {notas && (
                      <p className="text-xs text-orange-300 mt-1 line-clamp-2">📝 {notas}</p>
                    )}
                    
                    <p className="text-orange-400 font-bold text-sm sm:text-base mt-1">
                      ${(cartItem.item.precio * cartItem.quantity).toFixed(2)}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(cartItem.id, -1)}
                        className="w-8 h-8 bg-gray-600 hover:bg-gray-500 rounded-lg flex items-center justify-center"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-bold">{cartItem.quantity}</span>
                      <button
                        onClick={() => updateQuantity(cartItem.id, 1)}
                        className="w-8 h-8 bg-orange-500 hover:bg-orange-600 rounded-lg flex items-center justify-center"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <div className="px-4 sm:px-6 py-4 sm:py-5 border-t border-gray-700 space-y-4 bg-gray-800">
        <div className="bg-gray-700/50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-gray-400">
            <span>Productos</span>
            <span>{itemCount}</span>
          </div>
          <div className="flex justify-between text-xl font-bold">
            <span>Total</span>
            <span className="text-orange-400">${total.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={sendOrder}
          disabled={sending || cart.length === 0}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 sm:py-5 rounded-xl text-base sm:text-lg transition-all flex items-center justify-center gap-3"
        >
          {sending ? (
            <>
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              <span>Enviando...</span>
            </>
          ) : (
            <>
              <PaperAirplaneIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Enviar Orden</span>
            </>
          )}
        </button>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-xl transition-all text-sm"
          >
            Limpiar Carrito
          </button>
        )}
      </div>
    </>
  );
}