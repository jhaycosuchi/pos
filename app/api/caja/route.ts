import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '../../../lib/auth';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || (user.rol !== 'caja' && user.rol !== 'admin')) {
      return NextResponse.json({ message: 'No tienes permisos' }, { status: 403 });
    }

    const db = getDb();

    // Verificar si hay caja abierta
    const cajaAbierta = db.prepare('SELECT * FROM caja WHERE estado = "abierta" ORDER BY id DESC LIMIT 1').get();

    if (!cajaAbierta) {
      return NextResponse.json({ abierta: false });
    }

    // Obtener transacciones del día
    const transacciones = db.prepare(`
      SELECT t.*, p.numero_pedido
      FROM transacciones t
      LEFT JOIN pedidos p ON t.pedido_id = p.id
      WHERE t.caja_id = ?
      ORDER BY t.fecha DESC
    `).all(cajaAbierta.id);

    // Calcular totales
    const totalVentas = (transacciones as any[])
      .filter((t: any) => t.tipo === 'venta')
      .reduce((sum: number, t: any) => sum + t.monto, 0);

    return NextResponse.json({
      abierta: true,
      caja: cajaAbierta,
      transacciones,
      totalVentas
    });
  } catch (error) {
    console.error('Error obteniendo estado de caja:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || (user.rol !== 'caja' && user.rol !== 'admin')) {
      return NextResponse.json({ message: 'No tienes permisos' }, { status: 403 });
    }

    const { accion, montoInicial } = await request.json();
    const db = getDb();

    if (accion === 'abrir') {
      // Verificar si ya hay caja abierta
      const cajaAbierta = db.prepare('SELECT * FROM caja WHERE estado = "abierta"').get();
      if (cajaAbierta) {
        return NextResponse.json({ message: 'Ya hay una caja abierta' }, { status: 400 });
      }

      // Abrir nueva caja
      const result = db.prepare(
        'INSERT INTO caja (usuario_id, monto_inicial) VALUES (?, ?)'
      ).run(user.id, montoInicial || 0);

      return NextResponse.json({
        message: 'Caja abierta exitosamente',
        cajaId: result.lastInsertRowid
      });
    }

    if (accion === 'cerrar') {
      // Encontrar caja abierta
      const cajaAbierta = db.prepare('SELECT * FROM caja WHERE estado = "abierta" ORDER BY id DESC LIMIT 1').get();
      if (!cajaAbierta) {
        return NextResponse.json({ message: 'No hay caja abierta' }, { status: 400 });
      }

      // Calcular monto final
      const totalVentas = db.prepare(`
        SELECT SUM(monto) as total FROM transacciones
        WHERE caja_id = ? AND tipo = 'venta'
      `).get(cajaAbierta.id);

      const montoFinal = (cajaAbierta.monto_inicial || 0) + (totalVentas?.total || 0);

      // Cerrar caja
      db.prepare(
        'UPDATE caja SET estado = "cerrada", fecha_cierre = CURRENT_TIMESTAMP, monto_final = ? WHERE id = ?'
      ).run(montoFinal, cajaAbierta.id);

      return NextResponse.json({
        message: 'Caja cerrada exitosamente',
        montoFinal
      });
    }

    return NextResponse.json({ message: 'Acción no válida' }, { status: 400 });
  } catch (error) {
    console.error('Error en operación de caja:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}