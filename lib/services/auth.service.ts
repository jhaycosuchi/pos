/**
 * Servicio de autenticación y gestión de usuarios
 */

import { API } from '@/lib/config';

export interface Usuario {
  id: number;
  username: string;
  nombre: string;
  rol: 'mesero' | 'caja' | 'admin';
  activo?: boolean;
}

export class AuthService {
  private static readonly STORAGE_KEY = 'pos_user';
  private static readonly DEFAULT_MESERO_ID = 4; // Fallback si no hay usuario

  /**
   * Obtiene el usuario actual del localStorage
   */
  static obtenerUsuarioActual(): Usuario | null {
    if (typeof window === 'undefined') return null;

    try {
      const userData = localStorage.getItem(this.STORAGE_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }
  }

  /**
   * Guarda el usuario en localStorage
   */
  static guardarUsuario(usuario: Usuario): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(usuario));
    } catch (error) {
      console.error('Error al guardar usuario:', error);
    }
  }

  /**
   * Obtiene el ID del mesero actual o un default
   */
  static obtenerMeseroId(): number {
    const usuario = this.obtenerUsuarioActual();
    
    // Si hay usuario y es mesero, usar su ID
    if (usuario && usuario.rol === 'mesero') {
      return usuario.id;
    }

    // Si es admin o caja, también puede crear pedidos
    if (usuario) {
      return usuario.id;
    }

    // Fallback a mesero por defecto
    return this.DEFAULT_MESERO_ID;
  }

  /**
   * Verifica las credenciales del usuario
   */
  static async verificarCredenciales(username: string, password: string): Promise<Usuario | null> {
    try {
      const response = await fetch(API.AUTH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.usuario || null;
    } catch (error) {
      console.error('Error al verificar credenciales:', error);
      return null;
    }
  }

  /**
   * Cierra la sesión del usuario
   */
  static cerrarSesion(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  static tieneRol(rol: 'mesero' | 'caja' | 'admin'): boolean {
    const usuario = this.obtenerUsuarioActual();
    return usuario?.rol === rol;
  }

  /**
   * Verifica si el usuario es admin
   */
  static esAdmin(): boolean {
    return this.tieneRol('admin');
  }
}
