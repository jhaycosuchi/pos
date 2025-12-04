'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, Utensils, Zap, CreditCard } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { PAGES, IMAGES } from '@/lib/config';

export default function InitialDeliveryOptions() {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800/95 backdrop-blur-md py-6 sm:py-8 px-4 border-b border-gray-700">
        <div className="text-center">
          <Image 
            src={IMAGES.LOGO} 
            alt="Logo" 
            width={80} 
            height={80}
            className="mx-auto mb-3 sm:mb-4 drop-shadow-lg w-16 sm:w-20"
            priority
          />
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1 sm:mb-2">Mazuhi Sushi</h1>
          <p className="text-gray-400 text-base sm:text-lg">Selecciona cómo deseas continuar</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          
          {/* Para Llevar */}
          <motion.div
            whileHover={{ scale: 1.05, y: -10 }}
            whileTap={{ scale: 0.95 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl sm:rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
            <Link
              href="/atiendemesero/para-llevar"
              className="relative w-full h-full bg-gray-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center hover:shadow-2xl transition duration-300 border-2 border-blue-500/30 group-hover:border-blue-400 flex flex-col items-center justify-center min-h-64 sm:min-h-80 block"
            >
              <ShoppingBag className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 text-blue-400 mb-3 sm:mb-6" />
              <div className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">Para Llevar</div>
              <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-4 sm:mb-6">Prepara tu orden para llevar en casa</p>
              <div className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white font-bold text-sm sm:text-base rounded-xl hover:bg-blue-700 transition">
                Continuar
              </div>
            </Link>
          </motion.div>

          {/* Comer Aquí */}
          <motion.div
            whileHover={{ scale: 1.05, y: -10 }}
            whileTap={{ scale: 0.95 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl sm:rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
            <Link
              href="/atiendemesero/comer-aqui"
              className="relative w-full h-full bg-gray-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center hover:shadow-2xl transition duration-300 border-2 border-emerald-500/30 group-hover:border-emerald-400 flex flex-col items-center justify-center min-h-64 sm:min-h-80 block"
            >
              <Utensils className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 text-emerald-400 mb-3 sm:mb-6" />
              <div className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">Comer Aquí</div>
              <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-4 sm:mb-6">Selecciona una mesa y come en el restaurante</p>
              <div className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-emerald-600 text-white font-bold text-sm sm:text-base rounded-xl hover:bg-emerald-700 transition">
                Seleccionar Mesa
              </div>
            </Link>
          </motion.div>

          {/* Áreas Activas */}
          <motion.div
            whileHover={{ scale: 1.05, y: -10 }}
            whileTap={{ scale: 0.95 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
            <Link
              href={PAGES.AREAS_ACTIVAS}
              className="relative w-full h-full bg-gray-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center hover:shadow-2xl transition duration-300 border-2 border-purple-500/30 group-hover:border-purple-400 flex flex-col items-center justify-center min-h-64 sm:min-h-80 block"
            >
              <Zap className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 text-purple-400 mb-3 sm:mb-6" />
              <div className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">Áreas Activas</div>
              <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-4 sm:mb-6">Agrega más pedidos o cobra mesas ocupadas</p>
              <div className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 text-white font-bold text-sm sm:text-base rounded-xl hover:bg-purple-700 transition">
                Ver Activas
              </div>
            </Link>
          </motion.div>

          {/* Caja */}
          <motion.div
            whileHover={{ scale: 1.05, y: -10 }}
            whileTap={{ scale: 0.95 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl sm:rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
            <Link
              href={PAGES.CAJA}
              className="relative w-full h-full bg-gray-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center hover:shadow-2xl transition duration-300 border-2 border-orange-500/30 group-hover:border-orange-400 flex flex-col items-center justify-center min-h-64 sm:min-h-80 block"
            >
              <CreditCard className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 text-orange-400 mb-3 sm:mb-6" />
              <div className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">🏪 Caja</div>
              <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-4 sm:mb-6">Finalize cobros de todas las cuentas</p>
              <div className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-orange-600 text-white font-bold text-sm sm:text-base rounded-xl hover:bg-orange-700 transition">
                Abrir Caja
              </div>
            </Link>
          </motion.div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="bg-gray-800/50 border-t border-gray-700 py-3 sm:py-4 px-4 sm:px-6 text-center text-gray-400 text-xs sm:text-sm">
        <p>Sistema de pedidos Mazuhi • Versión 1.0</p>
      </footer>
    </div>
  );
}
