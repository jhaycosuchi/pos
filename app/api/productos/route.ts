import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '../../../lib/auth';

export async function GET() {
  try {
    const db = getDb();
    const productos = db.prepare('SELECT * FROM productos WHERE estado = 1 ORDER BY categoria, nombre').all();

    return NextResponse.json(productos);
  } catch (error) {
    console.error('Error fetching productos:', error);
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
    if (!user || user.rol !== 'admin') {
      return NextResponse.json({ message: 'No tienes permisos' }, { status: 403 });
    }

    const { nombre, descripcion, precio, categoria, stock } = await request.json();

    if (!nombre || !precio || !categoria) {
      return NextResponse.json(
        { message: 'Nombre, precio y categoría son requeridos' },
        { status: 400 }
      );
    }

    const db = getDb();
    const result = db.prepare(
      'INSERT INTO productos (nombre, descripcion, precio, categoria, stock) VALUES (?, ?, ?, ?, ?)'
    ).run(nombre, descripcion || '', precio, categoria, stock || 0);

    return NextResponse.json({
      message: 'Producto creado exitosamente',
      productoId: result.lastID
    });
  } catch (error) {
    console.error('Error creando producto:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}