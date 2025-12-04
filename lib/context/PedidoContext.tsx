/**
 * Contexto global para el estado del pedido
 * Permite compartir estado entre diferentes partes de la app sin mezclar con UI
 */

'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface CartItem {
  id: string;
  item: {
    id?: number;
    nombre: string;
    descripcion: string;
    precio: number;
    imagen_url: string;
    categoria?: string;
  };
  quantity: number;
  options: {
    notas: string[];
    notaPersonalizada: string;
  };
}

interface PedidoContextState {
  // Estado del carrito
  cart: CartItem[];
  
  // Información del pedido actual
  mesaNumero: string | null;
  esParaLlevar: boolean;
  cuentaId: number | null;
  continuePedidoId: number | null;
  
  // Acciones
  setMesaNumero: (mesa: string | null) => void;
  setEsParaLlevar: (esParaLlevar: boolean) => void;
  setCuentaId: (id: number | null) => void;
  setContinuePedidoId: (id: number | null) => void;
  
  agregarAlCarrito: (item: CartItem) => void;
  eliminarDelCarrito: (itemId: string) => void;
  actualizarCantidad: (itemId: string, cantidad: number) => void;
  limpiarCarrito: () => void;
  limpiarTodo: () => void;
  
  // Cálculos
  calcularTotal: () => number;
  obtenerCantidadItems: () => number;
}

const PedidoContext = createContext<PedidoContextState | undefined>(undefined);

export function PedidoProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mesaNumero, setMesaNumero] = useState<string | null>(null);
  const [esParaLlevar, setEsParaLlevar] = useState(false);
  const [cuentaId, setCuentaId] = useState<number | null>(null);
  const [continuePedidoId, setContinuePedidoId] = useState<number | null>(null);

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

  const eliminarDelCarrito = useCallback((itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  }, []);

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

  const limpiarCarrito = useCallback(() => {
    setCart([]);
  }, []);

  const limpiarTodo = useCallback(() => {
    setCart([]);
    setMesaNumero(null);
    setEsParaLlevar(false);
    setCuentaId(null);
    setContinuePedidoId(null);
  }, []);

  const calcularTotal = useCallback(() => {
    return cart.reduce((total, item) => 
      total + (item.item.precio * item.quantity), 0
    );
  }, [cart]);

  const obtenerCantidadItems = useCallback(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  return (
    <PedidoContext.Provider value={{
      cart,
      mesaNumero,
      esParaLlevar,
      cuentaId,
      continuePedidoId,
      setMesaNumero,
      setEsParaLlevar,
      setCuentaId,
      setContinuePedidoId,
      agregarAlCarrito,
      eliminarDelCarrito,
      actualizarCantidad,
      limpiarCarrito,
      limpiarTodo,
      calcularTotal,
      obtenerCantidadItems
    }}>
      {children}
    </PedidoContext.Provider>
  );
}

export function usePedidoContext() {
  const context = useContext(PedidoContext);
  if (!context) {
    throw new Error('usePedidoContext debe usarse dentro de PedidoProvider');
  }
  return context;
}
