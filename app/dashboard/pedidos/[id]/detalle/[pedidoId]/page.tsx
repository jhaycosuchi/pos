export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getDb } from '../../../../../../lib/db';
import PedidoDetailClient from './client';

interface DetallePedido {
  id: number;
  producto_nombre: string;
  cantidad: number;
  especificaciones: string;
  notas: string;
  precio_unitario: number;
  subtotal: number;
}

interface Pedido {
  id: number;
  numero_pedido: string;
  mesero_nombre: string;
  mesa_numero: string;
  es_para_llevar: number;
  comensales: number;
  estado: string;
  total: number;
  observaciones: string;
  creado_en: string;
  actualizado_en: string;
  detalles: DetallePedido[];
}

async function getPedidoDetalle(id: string): Promise<Pedido | null> {
  const db = getDb();
  
  const pedido = db.prepare(`
    SELECT
      p.id,
      p.numero_pedido,
      u.nombre as mesero_nombre,
      p.mesa_numero,
      p.es_para_llevar,
      p.comensales,
      p.estado,
      p.total,
      p.observaciones,
      p.creado_en,
      p.actualizado_en
    FROM pedidos p
    LEFT JOIN usuarios u ON p.mesero_id = u.id
    WHERE p.id = ?
  `, [parseInt(id)]).get() as any;

  if (!pedido) return null;

  const detalles = db.prepare(`
    SELECT
      id,
      producto_nombre,
      cantidad,
      especificaciones,
      notas,
      precio_unitario,
      subtotal
    FROM detalle_pedidos
    WHERE pedido_id = ?
  `, [parseInt(id)]).all() as DetallePedido[];

  return {
    ...pedido,
    detalles
  };
}

import { ChevronLeft } from 'lucide-react';

export default async function PedidoDetailPage({
  params,
}: {
  params: { id: string; pedidoId: string };
}) {
  const pedido = await getPedidoDetalle(params.pedidoId);

  if (!pedido) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`/dashboard/pedidos/${params.id}`}
            className="text-blue-600 hover:text-blue-900"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Pedido no encontrado</h1>
        </div>
      </div>
    );
  }

  return <PedidoDetailClient pedido={pedido} cuentaId={params.id} />;
}
