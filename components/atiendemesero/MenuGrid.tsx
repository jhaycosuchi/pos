'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { PlusIcon } from '@heroicons/react/24/outline';

interface MenuItem {
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  categoria?: string;
}

interface MenuCategory {
  id?: string;
  name?: string;
  nombre?: string;
  items: MenuItem[];
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

interface MenuGridProps {
  menuData: MenuCategory[];
  activeCategory: string;
  cart: CartItem[];
  onProductClick: (item: MenuItem) => void;
}

export default function MenuGrid({ menuData, activeCategory, cart, onProductClick }: MenuGridProps) {
  return (
    <main className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6">
        {menuData
          .find(c => (c.nombre || c.name) === activeCategory)
          ?.items?.map((item, index) => {
            const itemsInCart = cart.filter(c => c.item.nombre === item.nombre);
            const totalInCart = itemsInCart.reduce((sum, c) => sum + c.quantity, 0);
            
            return (
              <motion.div
                key={item.nombre + index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                className={`bg-gray-800 rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${
                  totalInCart > 0 ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-gray-900' : ''
                }`}
              >
                <div 
                  className="relative aspect-square cursor-pointer group"
                  onClick={() => onProductClick(item)}
                >
                  <Image
                    src={item.imagen_url || '/images/menu/placeholder.svg'}
                    alt={item.nombre}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    priority={index < 6}
                    quality={85}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('placeholder.svg')) {
                        target.src = '/images/menu/placeholder.svg';
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <PlusIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white drop-shadow-lg" />
                  </div>
                  {totalInCart > 0 && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs sm:text-sm font-bold w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                      {totalInCart}
                    </div>
                  )}
                </div>

                <div className="p-2 sm:p-3 md:p-4">
                  <h3 className="font-semibold text-xs sm:text-sm md:text-base lg:text-lg truncate text-white group-hover:text-orange-100 transition-colors">
                    {item.nombre}
                  </h3>
                  <p className="text-orange-400 font-bold text-sm sm:text-base md:text-lg lg:text-xl">
                    ${typeof item.precio === 'number' ? item.precio.toFixed(2) : '0.00'}
                  </p>
                </div>
              </motion.div>
            );
          })}
      </div>
    </main>
  );
}