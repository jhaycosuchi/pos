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
    if (!user || user.rol !== 'admin') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 });
    }

    const db = getDb();
    const usuario = db.prepare(
      'SELECT id, username, rol, nombre, activo as estado, creado_en FROM usuarios WHERE id = ?'
    ).get(params.id);

    if (!usuario) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(usuario);
  } catch (error) {
    console.error('Error fetching usuario:', error);
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
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 });
    }

    const { username, password, rol, nombre } = await request.json();

    if (!username || !rol || !nombre) {
      return NextResponse.json(
        { message: 'Usuario, rol y nombre son requeridos' },
        { status: 400 }
      );
    }

    if (!['mesero', 'caja', 'admin'].includes(rol)) {
      return NextResponse.json(
        { message: 'Rol inválido' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verificar si el usuario existe
    const existingUser = db.prepare('SELECT id FROM usuarios WHERE id = ?').get(params.id);
    if (!existingUser) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el username ya existe (excluyendo el usuario actual)
    const usernameCheck = db.prepare(
      'SELECT id FROM usuarios WHERE username = ? AND id != ?'
    ).get(username, params.id);
    if (usernameCheck) {
      return NextResponse.json(
        { message: 'El nombre de usuario ya existe' },
        { status: 400 }
      );
    }

    let query = 'UPDATE usuarios SET username = ?, rol = ?, nombre = ? WHERE id = ?';
    let params_array = [username, rol, nombre, params.id];

    // Si se proporciona una nueva contraseña, hashearla
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = 'UPDATE usuarios SET username = ?, password = ?, rol = ?, nombre = ? WHERE id = ?';
      params_array = [username, hashedPassword, rol, nombre, params.id];
    }

    db.prepare(query).run(...params_array);

    return NextResponse.json({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    console.error('Error updating usuario:', error);
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
    if (!user || user.rol !== 'admin') {
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

    // Verificar si el usuario existe
    const existingUser = db.prepare('SELECT id FROM usuarios WHERE id = ?').get(params.id);
    if (!existingUser) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    db.prepare('UPDATE usuarios SET estado = ? WHERE id = ?').run(estado ? 1 : 0, params.id);

    return NextResponse.json({ message: 'Estado actualizado exitosamente' });
  } catch (error) {
    console.error('Error updating usuario estado:', error);
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
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 });
    }

    const db = getDb();

    // Verificar si el usuario existe
    const existingUser = db.prepare('SELECT id FROM usuarios WHERE id = ?').get(params.id);
    if (!existingUser) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // No permitir eliminar al último admin
    if (existingUser.rol === 'admin') {
      const adminCount = db.prepare('SELECT COUNT(*) as count FROM usuarios WHERE rol = ? AND activo = 1').get('admin') as any;
      if (adminCount.count <= 1) {
        return NextResponse.json(
          { message: 'No se puede eliminar al último administrador activo' },
          { status: 400 }
        );
      }
    }

    db.prepare('DELETE FROM usuarios WHERE id = ?').run(params.id);

    return NextResponse.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting usuario:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}