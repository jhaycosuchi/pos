import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';
import { cookies } from 'next/headers';
import { verifyToken } from '../../../lib/auth';

export async function GET() {
  try {
    const db = getDb();
    
    // Obtener todos los items del menú con sus detalles
    const items = db.prepare(`
      SELECT 
        mi.id,
        mi.nombre,
        mi.descripcion,
        mi.precio,
        mi.imagen_url,
        mi.imagen_local,
        mi.vegetariano,
        mi.picante,
        mi.favorito,
        mi.destacado,
        mc.nombre as categoria,
        mc.id as categoria_id
      FROM menu_items mi
      JOIN menu_categorias mc ON mi.categoria_id = mc.id
      WHERE mi.activo = 1
      ORDER BY mc.orden, mi.nombre
    `).all();
    
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error getting menu items:', error);
    return NextResponse.json(
      { message: 'Error obteniendo items del menú' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticación
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.rol !== 'admin') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 });
    }

    const { id, precio, descripcion, imagen_url, vegetariano, picante, favorito, destacado } = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: 'ID del item es requerido' },
        { status: 400 }
      );
    }

    const db = getDb();
    
    // Actualizar el item
    db.prepare(
      `UPDATE menu_items 
       SET precio = ?, descripcion = ?, imagen_url = ?, 
           vegetariano = ?, picante = ?, favorito = ?, destacado = ?,
           actualizado_en = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).run(precio || null, descripcion || null, imagen_url || null, 
       vegetariano ? 1 : 0, picante ? 1 : 0, favorito ? 1 : 0, destacado ? 1 : 0, id);

    return NextResponse.json({ message: 'Item actualizado exitosamente' });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json(
      { message: 'Error actualizando item' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.rol !== 'admin') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 });
    }

    const { categoria_id, nombre, descripcion, precio, imagen_url } = await request.json();

    if (!categoria_id || !nombre || !precio) {
      return NextResponse.json(
        { message: 'Datos incompletos' },
        { status: 400 }
      );
    }

    const db = getDb();
    
    const result = db.prepare(
      `INSERT INTO menu_items 
       (categoria_id, nombre, descripcion, precio, imagen_url, activo, creado_en, actualizado_en)
       VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    ).run(categoria_id, nombre, descripcion || null, precio, imagen_url || null);

    return NextResponse.json({ 
      message: 'Item creado exitosamente',
      id: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { message: 'Error creando item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticación
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.rol !== 'admin') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: 'ID del item es requerido' },
        { status: 400 }
      );
    }

    const db = getDb();
    
    // Marcar como inactivo en lugar de eliminar
    db.prepare(
      `UPDATE menu_items SET activo = 0, actualizado_en = CURRENT_TIMESTAMP WHERE id = ?`
    ).run(id);

    return NextResponse.json({ message: 'Item eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json(
      { message: 'Error eliminando item' },
      { status: 500 }
    );
  }
}
