'use client';

import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface TipoSelectorProps {
  mesa: string;
  onBack: () => void;
  onSelectTipo: (paraLlevar: boolean) => void;
}

export default function TipoSelector({ mesa, onBack, onSelectTipo }: TipoSelectorProps) {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-gray-900 flex flex-col">
      <header className="bg-gray-800 p-4 sm:p-6">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button 
            onClick={onBack}
            className="text-gray-400 hover:text-white flex items-center gap-2"
          >
            <XMarkIcon className="w-5 h-5" />
            <span className="text-sm">Volver</span>
          </button>
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-white">Mesa {mesa}</h1>
          </div>
          <div className="w-16"></div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-8 sm:mb-12 text-center">
          ¿Como sera el pedido?
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full max-w-2xl px-4">
          {/* Para Comer Aqui */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelectTipo(false)}
            className="flex-1 py-8 sm:py-12 px-6 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center text-white font-bold shadow-xl hover:shadow-blue-500/30 transition-all duration-300 border-2 border-blue-500"
          >
            <span className="text-5xl sm:text-6xl mb-3">🍽️</span>
            <span className="text-xl sm:text-2xl">Para Comer Aqui</span>
            <span className="text-sm text-blue-200 mt-2">El cliente come en el restaurante</span>
          </motion.button>

          {/* Para Llevar */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelectTipo(true)}
            className="flex-1 py-8 sm:py-12 px-6 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center text-white font-bold shadow-xl hover:shadow-green-500/30 transition-all duration-300 border-2 border-green-500"
          >
            <span className="text-5xl sm:text-6xl mb-3">📦</span>
            <span className="text-xl sm:text-2xl">Para Llevar</span>
            <span className="text-sm text-green-200 mt-2">El cliente se lleva la comida</span>
          </motion.button>
        </div>
      </main>
    </div>
  );
}