import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';
import { VISIBLE_IN, ACCOUNT_STATES } from '../../../lib/statesConfig';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const db = getDb();

    console.log('AreasActivas GET - Fetching all active accounts');

    // Usar la configuración centralizada para filtrar estados
    // Solo mostrar cuentas abierta y cerrada (NO cobradas)
    const validStates = VISIBLE_IN.AREAS_ACTIVAS;
    console.log('validStates:', validStates);
    
    const stateFilter = validStates.map(s => `'${s}'`).join(',');
    console.log('stateFilter:', stateFilter);

    const query = `
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
        (SELECT SUM(total) FROM pedidos WHERE cuenta_id = c.id) as total_calculado,
        CASE WHEN c.mesa_numero = 'PARA_LLEVAR' THEN 1 ELSE 0 END as es_para_llevar
      FROM cuentas c
      LEFT JOIN mesas m ON c.mesa_numero = m.numero
      WHERE c.estado IN (${stateFilter})
      ORDER BY CASE WHEN c.mesa_numero = 'PARA_LLEVAR' THEN 1 ELSE 0 END DESC, c.fecha_apertura DESC
    `;
    
    console.log('Query:', query);

    const cuentasAbiertas = db.prepare(query).all();

    console.log('Cuentas encontradas:', cuentasAbiertas.length, cuentasAbiertas);

    // Combinar y formatear resultados
    const areasActivas = cuentasAbiertas.map((c: any) => ({
      id: c.id,
      mesa_numero: c.mesa_numero,
      capacidad: c.capacidad,
      estado: c.estado,
      mesero_id: c.mesero_id,
      tipo: 'cuenta',
      numero_cuenta: c.numero_cuenta,
      total: c.total_calculado || c.total || 0,
      total_pedidos: c.total_pedidos,
      creado_en: c.creado_en,
      es_para_llevar: c.es_para_llevar
    }));

    console.log('Total cuentas en areas activas:', areasActivas.length);
    return NextResponse.json(areasActivas, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error fetching areas activas:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  }
}