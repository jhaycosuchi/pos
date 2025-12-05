'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LogIn, AlertCircle } from 'lucide-react';
import { API, PAGES, IMAGES } from '@/lib/config';

export default function AtiendemeseroLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(API.AUTH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        setError('Usuario o contraseña incorrectos');
        setLoading(false);
        return;
      }

      const data = await response.json();

      // Verificar que sea mesero
      if (data.user.rol !== 'mesero') {
        setError('Solo meseros pueden acceder a esta sección');
        setLoading(false);
        return;
      }

      // Login exitoso - guardar info en sessionStorage PRIMERO
      sessionStorage.setItem('meseroInfo', JSON.stringify(data.user));
      
      // Esperar un poco para asegurar que sessionStorage está listo
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Luego redirigir
      router.push(PAGES.ATIENDEMESERO);
    } catch (err) {
      setError('Error al iniciar sesión');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-3 sm:p-4">
      {/* Logo y Título */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
          <Image 
            src={IMAGES.LOGO}
            alt="Logo" 
            width={48}
            height={48}
            className="sm:w-[60px] sm:h-[60px]"
          />
          <h1 className="text-white font-bold text-3xl sm:text-5xl">Mazuhi</h1>
        </div>
        <p className="text-gray-400 text-sm sm:text-lg">Modo Mesero</p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-8 space-y-4 sm:space-y-6 border border-gray-700"
      >
        <h2 className="text-white text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">Iniciar Sesión</h2>

        {/* Username */}
        <div>
          <label className="block text-gray-300 font-semibold mb-2 sm:mb-3 text-sm sm:text-lg">Usuario</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Tu usuario"
            className="w-full px-3 sm:px-5 py-3 sm:py-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm sm:text-lg transition-all"
            disabled={loading}
            autoFocus
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-gray-300 font-semibold mb-2 sm:mb-3 text-sm sm:text-lg">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tu contraseña"
            className="w-full px-3 sm:px-5 py-3 sm:py-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm sm:text-lg transition-all"
            disabled={loading}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 sm:p-4 flex items-start gap-3">
            <AlertCircle className="h-5 sm:h-6 w-5 sm:w-6 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 font-semibold text-sm sm:text-base">{error}</p>
          </div>
        )}

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading || !username || !password}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 sm:py-4 rounded-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-lg shadow-lg hover:shadow-xl disabled:shadow-none mt-6 sm:mt-8"
        >
          <LogIn className="h-5 sm:h-6 w-5 sm:w-6" />
          {loading ? 'Iniciando...' : 'Iniciar Sesión'}
        </button>
      </form>

      {/* Footer */}
      <div className="text-center mt-8 sm:mt-12">
        <p className="text-gray-500 text-xs sm:text-sm font-medium">
          Versión 1.0 • Optimizado para móvil y tablet
        </p>
      </div>
    </div>
  );
}
