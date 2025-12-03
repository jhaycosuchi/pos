import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { verifyToken } from '../../../../lib/auth';

export async function GET(
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
    if (!user || !['admin', 'caja'].includes(user.rol)) {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 });
    }

    const db = getDb();
    const mesero = db.prepare(
      'SELECT id, username, nombre, activo as estado, creado_en FROM usuarios WHERE id = ? AND rol = ?'
    ).get(params.id, 'mesero');

    if (!mesero) {
      return NextResponse.json(
        { message: 'Mesero no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(mesero);
  } catch (error) {
    console.error('Error fetching mesero:', error);
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
    if (!user || !['admin', 'caja'].includes(user.rol)) {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 });
    }

    const { username, password, nombre } = await request.json();

    if (!username || !nombre) {
      return NextResponse.json(
        { message: 'Usuario y nombre son requeridos' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verificar si el mesero existe
    const existingMesero = db.prepare('SELECT id FROM usuarios WHERE id = ? AND rol = ?').get(params.id, 'mesero');
    if (!existingMesero) {
      return NextResponse.json(
        { message: 'Mesero no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el username ya existe (excluyendo el mesero actual)
    const usernameCheck = db.prepare(
      'SELECT id FROM usuarios WHERE username = ? AND id != ?'
    ).get(username, params.id);
    if (usernameCheck) {
      return NextResponse.json(
        { message: 'El nombre de usuario ya existe' },
        { status: 400 }
      );
    }

    let query = 'UPDATE usuarios SET username = ?, nombre = ? WHERE id = ? AND rol = ?';
    let params_array = [username, nombre, params.id, 'mesero'];

    // Si se proporciona una nueva contraseña, hashearla
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = 'UPDATE usuarios SET username = ?, password = ?, nombre = ? WHERE id = ? AND rol = ?';
      params_array = [username, hashedPassword, nombre, params.id, 'mesero'];
    }

    db.prepare(query).run(...params_array);

    return NextResponse.json({ message: 'Mesero actualizado exitosamente' });
  } catch (error) {
    console.error('Error updating mesero:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    if (!user || !['admin', 'caja'].includes(user.rol)) {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 });
    }

    const { estado } = await request.json();

    if (typeof estado !== 'boolean') {
      return NextResponse.json(
        { message: 'Estado debe ser un booleano' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verificar si el mesero existe
    const existingMesero = db.prepare('SELECT id FROM usuarios WHERE id = ? AND rol = ?').get(params.id, 'mesero');
    if (!existingMesero) {
      return NextResponse.json(
        { message: 'Mesero no encontrado' },
        { status: 404 }
      );
    }

    db.prepare('UPDATE usuarios SET estado = ? WHERE id = ? AND rol = ?').run(estado ? 1 : 0, params.id, 'mesero');

    return NextResponse.json({ message: 'Estado actualizado exitosamente' });
  } catch (error) {
    console.error('Error updating mesero estado:', error);
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
    if (!user || !['admin', 'caja'].includes(user.rol)) {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 });
    }

    const db = getDb();

    // Verificar si el mesero existe
    const existingMesero = db.prepare('SELECT id FROM usuarios WHERE id = ? AND rol = ?').get(params.id, 'mesero');
    if (!existingMesero) {
      return NextResponse.json(
        { message: 'Mesero no encontrado' },
        { status: 404 }
      );
    }

    db.prepare('DELETE FROM usuarios WHERE id = ? AND rol = ?').run(params.id, 'mesero');

    return NextResponse.json({ message: 'Mesero eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting mesero:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}