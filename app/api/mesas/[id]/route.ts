import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const mesa = db.prepare(`
      SELECT id, numero, capacidad, estado, mesero_id, creado_en
      FROM mesas
      WHERE id = ?
    `).get(id);

    if (!mesa) {
      return NextResponse.json(
        { message: 'Mesa no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(mesa);
  } catch (error) {
    console.error('Error fetching mesa:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const { estado, pagado_con, total } = await request.json();

    if (!estado) {
      return NextResponse.json(
        { message: 'El estado es requerido' },
        { status: 400 }
      );
    }

    // Verificar que la mesa existe
    const mesa = db.prepare('SELECT id FROM mesas WHERE id = ?').get(id);
    if (!mesa) {
      return NextResponse.json(
        { message: 'Mesa no encontrada' },
        { status: 404 }
      );
    }

    // Si se está cerrando la mesa, registrar el cobro (si existe caja abierta)
    if (estado === 'disponible' && pagado_con && total !== undefined) {
      try {
        // Verificar si hay caja abierta
        const cajaAbierta = db.prepare(`
          SELECT id FROM caja WHERE estado = 'abierta' LIMIT 1
        `).get();

        if (cajaAbierta) {
          // Registrar transacción solo si existe caja
          db.prepare(`
            INSERT INTO transacciones (caja_id, tipo, monto, descripcion, fecha)
            VALUES (?, 'venta', ?, ?, CURRENT_TIMESTAMP)
          `).run(cajaAbierta.id, total, `Cierre mesa ${mesa.id} - ${pagado_con}`);
        }
      } catch (txError) {
        // Si falla el registro de transacción, no interrumpir el cierre de mesa
        console.warn('Warning registering transaction:', txError);
      }
    }

    // Actualizar mesa
    const result = db.prepare(`
      UPDATE mesas 
      SET estado = ?
      WHERE id = ?
    `).run(estado, id);

    return NextResponse.json({
      message: 'Mesa actualizada exitosamente',
      id: id,
      estado
    });
  } catch (error) {
    console.error('Error updating mesa:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    const mesa = db.prepare('SELECT id FROM mesas WHERE id = ?').get(id);
    if (!mesa) {
      return NextResponse.json(
        { message: 'Mesa no encontrada' },
        { status: 404 }
      );
    }

    db.prepare('DELETE FROM mesas WHERE id = ?').run(id);

    return NextResponse.json({
      message: 'Mesa eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error deleting mesa:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
