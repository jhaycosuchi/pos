import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';
import bcrypt from 'bcryptjs';
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
    if (!user || user.rol !== 'admin') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 });
    }

    const db = getDb();
    const usuarios = db.prepare(`
      SELECT id, username, rol, nombre, activo as estado, creado_en
      FROM usuarios
      ORDER BY creado_en DESC
    `).all();

    return NextResponse.json(usuarios);
  } catch (error) {
    console.error('Error fetching usuarios:', error);
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
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 });
    }

    const { username, password, rol, nombre } = await request.json();

    if (!username || !password || !rol || !nombre) {
      return NextResponse.json(
        { message: 'Todos los campos son requeridos' },
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

    // Verificar si el username ya existe
    const existingUser = db.prepare('SELECT id FROM usuarios WHERE username = ?').get(username);
    if (existingUser) {
      return NextResponse.json(
        { message: 'El nombre de usuario ya existe' },
        { status: 400 }
      );
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar el nuevo usuario
    const result = db.prepare(
      'INSERT INTO usuarios (username, password, rol, nombre) VALUES (?, ?, ?, ?)'
    ).run(username, hashedPassword, rol, nombre);

    return NextResponse.json({
      message: 'Usuario creado exitosamente',
      id: result.lastID
    });
  } catch (error) {
    console.error('Error creating usuario:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}