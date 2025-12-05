import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';

// Función para obtener fecha en zona horaria de México (Querétaro)
function getMexicoDate(): Date {
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: 'America/Mexico_City' }));
}

export async function POST(request: NextRequest) {
  try {
    const {
      tipo,
      pedido_id,
      cuenta_id,
      solicitado_por,
      detalles,
      cambios
    } = await request.json();

    if (!tipo || !pedido_id || !cuenta_id || !solicitado_por) {
      return NextResponse.json(
        { message: 'Datos incompletos - Se requiere: tipo, pedido_id, cuenta_id, solicitado_por' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verificar que el pedido existe
    const pedido = db.prepare('SELECT id, numero_pedido FROM pedidos WHERE id = ?').get(pedido_id);
    if (!pedido) {
      return NextResponse.json(
        { message: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que la cuenta existe
    const cuenta = db.prepare('SELECT id, numero_cuenta FROM cuentas WHERE id = ?').get(cuenta_id);
    if (!cuenta) {
      return NextResponse.json(
        { message: 'Cuenta no encontrada' },
        { status: 404 }
      );
    }

    // Crear la petición de modificación
    const result = db.prepare(`
      INSERT INTO modificaciones_pedidos (
        tipo,
        pedido_id,
        cuenta_id,
        solicitado_por,
        detalles,
        cambios,
        estado,
        fecha_solicitud
      ) VALUES (?, ?, ?, ?, ?, ?, 'pendiente', datetime('now'))
    `).run(tipo, pedido_id, cuenta_id, solicitado_por, detalles || '', cambios || '');

    console.log(`Petición de ${tipo} creada para pedido ${pedido.numero_pedido} en cuenta ${cuenta.numero_cuenta}`);

    return NextResponse.json({
      message: 'Petición de modificación creada exitosamente',
      modificacion_id: result.lastInsertRowid,
      tipo,
      pedido: pedido.numero_pedido,
      cuenta: cuenta.numero_cuenta
    });
  } catch (error) {
    console.error('Error creando petición de modificación:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor', error: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado') || 'pendiente';

    const modificaciones = db.prepare(`
      SELECT
        mp.*,
        p.numero_pedido as pedido_numero,
        c.numero_cuenta as cuenta_numero,
        c.mesa_numero,
        u.nombre as mesero_nombre
      FROM modificaciones_pedidos mp
      LEFT JOIN pedidos p ON mp.pedido_id = p.id
      LEFT JOIN cuentas c ON mp.cuenta_id = c.id
      LEFT JOIN usuarios u ON p.mesero_id = u.id
      WHERE mp.estado = ?
      ORDER BY mp.fecha_solicitud DESC
    `).all(estado);

    return NextResponse.json(modificaciones);
  } catch (error) {
    console.error('Error fetching modificaciones:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'ID de modificación requerido' },
        { status: 400 }
      );
    }

    const { estado, autorizado_por } = await request.json();

    if (!estado) {
      return NextResponse.json(
        { message: 'Datos incompletos - Se requiere: estado' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verificar que la modificación existe
    const modificacion = db.prepare('SELECT * FROM modificaciones_pedidos WHERE id = ?').get(id);
    if (!modificacion) {
      return NextResponse.json(
        { message: 'Modificación no encontrada' },
        { status: 404 }
      );
    }

    if (modificacion.estado !== 'pendiente') {
      return NextResponse.json(
        { message: 'Esta modificación ya ha sido procesada' },
        { status: 400 }
      );
    }

    // Si se aprueba y es eliminación, eliminar el pedido primero
    if (estado === 'aprobada' && modificacion.tipo === 'eliminacion') {
      try {
        console.log(`Eliminando pedido ${modificacion.pedido_id}...`);
        
        const deleteTransaction = db.transaction(() => {
          db.prepare('DELETE FROM modificaciones_pedidos WHERE pedido_id = ?').run(modificacion.pedido_id);
          console.log(`Modificaciones del pedido eliminadas`);
          
          db.prepare('DELETE FROM detalle_pedidos WHERE pedido_id = ?').run(modificacion.pedido_id);
          console.log(`Items del pedido eliminados`);
          
          db.prepare('DELETE FROM pedidos WHERE id = ?').run(modificacion.pedido_id);
          console.log(`Pedido eliminado`);
        });
        
        deleteTransaction();
        console.log(`Pedido ${modificacion.pedido_id} eliminado completamente`);
        
        return NextResponse.json({
          message: `Pedido eliminado exitosamente`,
          modificacion_id: id,
          estado: 'aprobada'
        });
      } catch (deleteError) {
        console.error(`Error al eliminar pedido: ${deleteError}`);
        throw deleteError;
      }
    }

    // Actualizar el estado de la modificación
    db.prepare(`
      UPDATE modificaciones_pedidos
      SET estado = ?, autorizado_por = ?, fecha_autorizacion = datetime('now')
      WHERE id = ?
    `).run(estado, autorizado_por || 'Caja', id);

    console.log(`Modificación ${id} ${estado} por ${autorizado_por}`);

    return NextResponse.json({
      message: `Modificación ${estado} exitosamente`,
      modificacion_id: id,
      estado,
      autorizado_por: autorizado_por || 'Caja'
    });
  } catch (error) {
    console.error('Error actualizando modificación:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor', error: String(error) },
      { status: 500 }
    );
  }
}