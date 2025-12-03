'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface MesaSelectorProps {
  onSelectMesa: (mesa: string) => void;
}

export default function MesaSelector({ onSelectMesa }: MesaSelectorProps) {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-gray-900 flex flex-col">
      <header className="bg-gray-800 p-4 sm:p-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Image 
            src="/images/iconologo.svg" 
            alt="Logo" 
            width={48} 
            height={48}
            className="w-10 h-10 sm:w-12 sm:h-12"
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Mazuhi</h1>
        </div>
        <p className="text-gray-400 text-sm sm:text-base">Sistema de Pedidos</p>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">
          Selecciona una Mesa
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 w-full max-w-lg">
          {['1', '2', '3', '4', '5', '6'].map(table => (
            <motion.button
              key={table}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectMesa(table)}
              className="aspect-square bg-gradient-to-br from-gray-700 to-gray-800 hover:from-orange-500 hover:to-orange-600 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center text-white font-bold shadow-lg hover:shadow-orange-500/30 transition-all duration-300 border border-gray-600 hover:border-orange-400"
            >
              <span className="text-4xl sm:text-5xl md:text-6xl mb-1">{table}</span>
              <span className="text-xs sm:text-sm text-gray-400">Mesa</span>
            </motion.button>
          ))}
        </div>
      </main>
    </div>
  );
}