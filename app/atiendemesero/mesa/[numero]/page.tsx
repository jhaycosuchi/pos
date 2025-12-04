/**
 * Página del menú para una mesa específica
 * Ruta: /atiendemesero/mesa/[numero]
 */

'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { usePedidoContext } from '@/lib/context/PedidoContext';
import MenuMesa from '@/components/atiendemesero/MenuMesa';

export default function MesaMenuPage() {
  const params = useParams();
  const mesaNumero = params.numero as string;
  const { setMesaNumero, setEsParaLlevar } = usePedidoContext();

  useEffect(() => {
    if (mesaNumero) {
      setMesaNumero(mesaNumero);
      setEsParaLlevar(false);
    }
  }, [mesaNumero, setMesaNumero, setEsParaLlevar]);

  if (!mesaNumero) {
    return <div>Mesa no especificada</div>;
  }

  return <MenuMesa mesaNumero={mesaNumero} />;
}
