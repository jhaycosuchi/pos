import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    
    // Obtener fecha de hoy en zona horaria de México
    const now = new Date();
    const mexicoDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Mexico_City' }));
    const today = mexicoDate.toISOString().split('T')[0];

    // Obtener cuentas abiertas del día (mesas con pedidos activos)
    const cuentasAbiertas = db.prepare(`
      SELECT
        c.id,
        c.numero_cuenta,
        c.mesa_numero,
        c.mesero_id,
        c.estado,
        c.total,
        c.fecha_apertura as creado_en,
        m.capacidad,
        'cuenta' as tipo,
        (SELECT COUNT(*) FROM pedidos WHERE cuenta_id = c.id) as total_pedidos,
        (SELECT SUM(total) FROM pedidos WHERE cuenta_id = c.id) as total_calculado
      FROM cuentas c
      LEFT JOIN mesas m ON c.mesa_numero = m.numero
      WHERE c.estado IN ('abierta', 'cerrada')
        AND DATE(c.fecha_apertura) = DATE(?)
      ORDER BY c.fecha_apertura DESC
    `).all(today);

    // Obtener pedidos para llevar pendientes (sin cuenta)
    const pedidosParaLlevar = db.prepare(`
      SELECT
        p.id,
        p.numero_pedido,
        p.mesa_numero,
        NULL as capacidad,
        p.estado,
        p.mesero_id,
        'pedido_llevar' as tipo,
        p.numero_pedido as numero_cuenta,
        p.es_para_llevar,
        p.total,
        p.creado_en,
        0 as total_pedidos
      FROM pedidos p
      WHERE p.es_para_llevar = 1 
        AND p.estado IN ('pendiente', 'preparando', 'listo')
        AND p.cuenta_id IS NULL
        AND DATE(p.creado_en) = DATE(?)
      ORDER BY p.creado_en DESC
    `).all(today);

    // Combinar y formatear resultados
    const areasActivas = [
      ...cuentasAbiertas.map((c: any) => ({
        id: c.id,
        mesa_numero: c.mesa_numero,
        capacidad: c.capacidad,
        estado: c.estado,
        mesero_id: c.mesero_id,
        tipo: 'cuenta',
        numero_cuenta: c.numero_cuenta,
        total: c.total_calculado || c.total || 0,
        total_pedidos: c.total_pedidos,
        creado_en: c.creado_en
      })),
      ...pedidosParaLlevar.map((p: any) => ({
        id: p.id,
        mesa_numero: p.mesa_numero,
        capacidad: null,
        estado: p.estado,
        mesero_id: p.mesero_id,
        tipo: 'pedido_llevar',
        numero_pedido: p.numero_pedido,
        es_para_llevar: p.es_para_llevar,
        total: p.total,
        creado_en: p.creado_en
      }))
    ];

    return NextResponse.json(areasActivas);
  } catch (error) {
    console.error('Error fetching areas activas:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}