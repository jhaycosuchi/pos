/**
 * Servicio centralizado para la gestión de pedidos
 * Este servicio maneja toda la lógica de negocio relacionada con pedidos
 */

import { API } from '@/lib/config';

export interface CreatePedidoData {
  mesero_id: number;
  mesa_numero: string;
  comensales?: number;
  es_para_llevar: boolean;
  cuenta_id?: number | null;
  items: PedidoItem[];
  total: number;
  estado?: string;
}

export interface PedidoItem {
  menu_item_id?: number;
  producto_nombre: string;
  cantidad: number;
  precio_unitario: number;
  especificaciones?: string;
  notas?: string;
}

export interface UpdatePedidoData {
  items?: PedidoItem[];
  estado?: string;
  total?: number;
}

export class PedidosService {
  /**
   * Crea un nuevo pedido
   */
  static async crearPedido(data: CreatePedidoData) {
    try {
      const response = await fetch(API.PEDIDOS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear pedido');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en crearPedido:', error);
      throw error;
    }
  }

  /**
   * Actualiza un pedido existente
   */
  static async actualizarPedido(pedidoId: number, data: UpdatePedidoData) {
    try {
      const response = await fetch(API.PEDIDO_BY_ID(pedidoId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar pedido');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en actualizarPedido:', error);
      throw error;
    }
  }

  /**
   * Agrega items a un pedido existente (PATCH)
   */
  static async agregarItems(pedidoId: number, items: PedidoItem[]) {
    try {
      const response = await fetch(API.PEDIDO_BY_ID(pedidoId), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al agregar items');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en agregarItems:', error);
      throw error;
    }
  }

  /**
   * Obtiene un pedido por ID
   */
  static async obtenerPedido(pedidoId: number) {
    try {
      const response = await fetch(API.PEDIDO_BY_ID(pedidoId));

      if (!response.ok) {
        throw new Error('Pedido no encontrado');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en obtenerPedido:', error);
      throw error;
    }
  }

  /**
   * Obtiene pedidos por mesa
   */
  static async obtenerPedidosPorMesa(mesaNumero: string) {
    try {
      const response = await fetch(API.PEDIDO_BY_MESA(mesaNumero));

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error en obtenerPedidosPorMesa:', error);
      return null;
    }
  }

  /**
   * Obtiene todos los pedidos con filtros opcionales
   */
  static async obtenerPedidos(estado?: string) {
    try {
      const url = estado ? `${API.PEDIDOS}?estado=${estado}` : API.PEDIDOS;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Error al obtener pedidos');
      }

      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error en obtenerPedidos:', error);
      return [];
    }
  }

  /**
   * Cambia el estado de un pedido
   */
  static async cambiarEstado(pedidoId: number, nuevoEstado: string) {
    try {
      const response = await fetch(API.PEDIDO_BY_ID(pedidoId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al cambiar estado');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en cambiarEstado:', error);
      throw error;
    }
  }

  /**
   * Valida los datos antes de crear un pedido
   */
  static validarDatosPedido(data: CreatePedidoData): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!data.mesero_id) {
      errores.push('El ID del mesero es requerido');
    }

    if (!data.mesa_numero) {
      errores.push('El número de mesa es requerido');
    }

    if (!data.items || data.items.length === 0) {
      errores.push('Debe agregar al menos un producto');
    }

    if (data.total <= 0) {
      errores.push('El total debe ser mayor a 0');
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }
}
