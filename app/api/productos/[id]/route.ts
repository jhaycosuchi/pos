import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '../../../../lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const producto = db.prepare('SELECT * FROM productos WHERE id = ?').get(params.id);

    if (!producto) {
      return NextResponse.json(
        { message: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(producto);
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.rol !== 'admin') {
      return NextResponse.json({ message: 'No tienes permisos' }, { status: 403 });
    }

    const { nombre, descripcion, precio, categoria, stock, estado } = await request.json();

    const db = getDb();

    // Verificar que el producto existe
    const productoExistente = db.prepare('SELECT * FROM productos WHERE id = ?').get(params.id);
    if (!productoExistente) {
      return NextResponse.json(
        { message: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar producto
    db.prepare(
      'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, categoria = ?, stock = ?, estado = ?, actualizado_en = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(
      nombre || productoExistente.nombre, descripcion || productoExistente.descripcion, precio || productoExistente.precio, categoria || productoExistente.categoria, stock !== undefined ? stock : productoExistente.stock, estado !== undefined ? estado : productoExistente.estado, params.id
    );

    return NextResponse.json({ message: 'Producto actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando producto:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.rol !== 'admin') {
      return NextResponse.json({ message: 'No tienes permisos' }, { status: 403 });
    }

    const db = getDb();

    // Verificar que el producto existe
    const producto = db.prepare('SELECT * FROM productos WHERE id = ?').get(params.id);
    if (!producto) {
      return NextResponse.json(
        { message: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Desactivar producto (no eliminar físicamente)
    db.prepare('UPDATE productos SET estado = 0 WHERE id = ?').run(params.id);

    return NextResponse.json({ message: 'Producto desactivado exitosamente' });
  } catch (error) {
    console.error('Error eliminando producto:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}