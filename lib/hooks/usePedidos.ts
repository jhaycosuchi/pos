/**
 * Hook personalizado para gestión de pedidos
 * Centraliza toda la lógica de carrito y creación de pedidos
 */

import { useState, useCallback } from 'react';
import { PedidosService, CreatePedidoData, PedidoItem } from '@/lib/services/pedidos.service';
import { AuthService } from '@/lib/services/auth.service';

export interface CartItemOptions {
  notas: string[];
  notaPersonalizada: string;
}

export interface CartItem {
  id: string;
  item: {
    nombre: string;
    descripcion: string;
    precio: number;
    imagen_url: string;
    categoria?: string;
  };
  quantity: number;
  options: CartItemOptions;
}

export function usePedidos() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Agrega un item al carrito
   */
  const agregarAlCarrito = useCallback((item: CartItem) => {
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(cartItem => 
        cartItem.item.nombre === item.item.nombre &&
        JSON.stringify(cartItem.options) === JSON.stringify(item.options)
      );

      if (existingIndex >= 0) {
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += item.quantity;
        return newCart;
      }

      return [...prevCart, item];
    });
  }, []);

  /**
   * Elimina un item del carrito
   */
  const eliminarDelCarrito = useCallback((itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  }, []);

  /**
   * Actualiza la cantidad de un item
   */
  const actualizarCantidad = useCallback((itemId: string, cantidad: number) => {
    if (cantidad <= 0) {
      eliminarDelCarrito(itemId);
      return;
    }

    setCart(prevCart => 
      prevCart.map(item => 
        item.id === itemId 
          ? { ...item, quantity: cantidad }
          : item
      )
    );
  }, [eliminarDelCarrito]);

  /**
   * Limpia el carrito
   */
  const limpiarCarrito = useCallback(() => {
    setCart([]);
  }, []);

  /**
   * Calcula el total del carrito
   */
  const calcularTotal = useCallback((): number => {
    return cart.reduce((total, item) => 
      total + (item.item.precio * item.quantity), 0
    );
  }, [cart]);

  /**
   * Convierte items del carrito a formato de pedido
   */
  const convertirItemsAPedido = useCallback((cartItems: CartItem[]): PedidoItem[] => {
    return cartItems.map(item => {
      const notas = [
        ...item.options.notas,
        item.options.notaPersonalizada
      ].filter(Boolean).join(', ');

      return {
        menu_item_id: 1,
        producto_nombre: item.item.nombre,
        cantidad: item.quantity,
        precio_unitario: item.item.precio,
        especificaciones: '',
        notas: notas || ''
      };
    });
  }, []);

  /**
   * Crea un nuevo pedido
   */
  const crearPedido = useCallback(async (
    mesaNumero: string,
    esParaLlevar: boolean,
    cuentaId?: number | null
  ): Promise<any> => {
    setLoading(true);
    setError(null);

    try {
      const meseroId = AuthService.obtenerMeseroId();
      const items = convertirItemsAPedido(cart);
      const total = calcularTotal();

      const pedidoData: CreatePedidoData = {
        mesero_id: meseroId,
        mesa_numero: mesaNumero,
        comensales: 1,
        es_para_llevar: esParaLlevar,
        cuenta_id: cuentaId,
        items,
        total,
        estado: 'pendiente'
      };

      // Validar antes de enviar
      const validacion = PedidosService.validarDatosPedido(pedidoData);
      if (!validacion.valido) {
        throw new Error(validacion.errores.join(', '));
      }

      const resultado = await PedidosService.crearPedido(pedidoData);
      
      // Limpiar carrito después de crear exitosamente
      limpiarCarrito();
      
      return resultado;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al crear el pedido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cart, calcularTotal, convertirItemsAPedido, limpiarCarrito]);

  /**
   * Agrega items a un pedido existente
   */
  const agregarItemsAPedido = useCallback(async (pedidoId: number): Promise<any> => {
    setLoading(true);
    setError(null);

    try {
      const items = convertirItemsAPedido(cart);

      if (items.length === 0) {
        throw new Error('No hay items en el carrito');
      }

      const resultado = await PedidosService.agregarItems(pedidoId, items);
      
      // Limpiar carrito después de agregar exitosamente
      limpiarCarrito();
      
      return resultado;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al agregar items al pedido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cart, convertirItemsAPedido, limpiarCarrito]);

  return {
    // Estado
    cart,
    loading,
    error,
    
    // Acciones del carrito
    agregarAlCarrito,
    eliminarDelCarrito,
    actualizarCantidad,
    limpiarCarrito,
    
    // Cálculos
    calcularTotal,
    cantidadItems: cart.length,
    
    // Acciones de pedidos
    crearPedido,
    agregarItemsAPedido
  };
}
