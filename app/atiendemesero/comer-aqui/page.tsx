/**
 * Página de selección de mesa para COMER AQUÍ
 * Ruta: /atiendemesero/comer-aqui
 * Muestra las mesas disponibles
 */

'use client';

import { useEffect } from 'react';
import { usePedidoContext } from '@/lib/context/PedidoContext';
import SeleccionMesas from '@/components/atiendemesero/SeleccionMesas';

export default function ComerAquiPage() {
  const { setEsParaLlevar, limpiarTodo } = usePedidoContext();

  useEffect(() => {
    // Limpiar estado anterior
    limpiarTodo();
    
    // Configurar para comer aquí (no para llevar)
    setEsParaLlevar(false);
  }, [setEsParaLlevar, limpiarTodo]);

  return <SeleccionMesas />;
}
