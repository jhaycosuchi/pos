/**
 * Servicio centralizado para la gestión del menú
 */

import { API } from '@/lib/config';

export interface MenuItem {
  id?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  categoria?: string;
}

export interface MenuCategory {
  id?: string;
  name?: string;
  nombre?: string;
  items: MenuItem[];
}

export class MenuService {
  /**
   * Obtiene todo el menú agrupado por categorías
   */
  static async obtenerMenu(): Promise<MenuCategory[]> {
    try {
      const response = await fetch(API.MENU);

      if (!response.ok) {
        throw new Error('Error al cargar el menú');
      }

      const data = await response.json();
      // El API devuelve directamente un array de categorías
      return Array.isArray(data) ? data : (data.categorias || []);
    } catch (error) {
      console.error('Error en obtenerMenu:', error);
      return [];
    }
  }

  /**
   * Obtiene items de una categoría específica
   */
  static async obtenerCategoria(categoriaId: string): Promise<MenuItem[]> {
    try {
      const menu = await this.obtenerMenu();
      const categoria = menu.find(cat => 
        (cat.id === categoriaId) || 
        (cat.name === categoriaId) || 
        (cat.nombre === categoriaId)
      );

      return categoria?.items || [];
    } catch (error) {
      console.error('Error en obtenerCategoria:', error);
      return [];
    }
  }

  /**
   * Busca un producto por nombre
   */
  static async buscarProducto(nombre: string): Promise<MenuItem | null> {
    try {
      const menu = await this.obtenerMenu();
      
      for (const categoria of menu) {
        const item = categoria.items.find(item => 
          item.nombre.toLowerCase() === nombre.toLowerCase()
        );
        if (item) return item;
      }

      return null;
    } catch (error) {
      console.error('Error en buscarProducto:', error);
      return null;
    }
  }
}
