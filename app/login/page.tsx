'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { API, PAGES, IMAGES } from '@/lib/config';
import { AuthService } from '@/lib/services';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(API.AUTH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        // Guardar usuario en localStorage
        if (data.user) {
          AuthService.guardarUsuario(data.user);
        }
        router.push(PAGES.HOME);
      } else {
        const data = await response.json();
        setError(data.message || 'Error de autenticación');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-200">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <Image
              src={IMAGES.LOGO}
              alt="Logo POS System"
              width={120}
              height={120}
              className="rounded-2xl shadow-xl border-4 border-white"
            />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-success rounded-full border-4 border-white shadow-lg"></div>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2 tracking-wide">POS System</h1>
          <p className="text-gray-600 font-medium">Sistema de Punto de Venta Profesional</p>
        </div>

        {/* Login Form */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-dark mb-2">Iniciar Sesión</h2>
            <p className="text-sm text-gray-500">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                placeholder="Ingresa tu usuario"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                placeholder="Ingresa tu contraseña"
                required
              />
            </div>

            {error && (
              <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Iniciando...</span>
                </>
              ) : (
                <span>Iniciar Sesión</span>
              )}
            </button>
          </form>

          <div className="text-center text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
            <strong>Usuario por defecto:</strong> admin / admin
          </div>
        </div>
      </div>
    </div>
  );
}