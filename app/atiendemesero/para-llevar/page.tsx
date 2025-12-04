/**
 * Página para pedidos PARA LLEVAR
 * Ruta: /atiendemesero/para-llevar
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePedidoContext } from '@/lib/context/PedidoContext';
import MenuParaLlevar from '@/components/atiendemesero/MenuParaLlevar';

export default function ParaLlevarPage() {
  const router = useRouter();
  const { setEsParaLlevar, setMesaNumero, limpiarTodo } = usePedidoContext();

  useEffect(() => {
    // Limpiar estado anterior
    limpiarTodo();
    
    // Configurar para llevar
    setEsParaLlevar(true);
    setMesaNumero('PARA_LLEVAR');
  }, [setEsParaLlevar, setMesaNumero, limpiarTodo]);

  return <MenuParaLlevar />;
}
