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
    if (!user) {
      return NextResponse.json({ message: 'Token inválido' }, { status: 401 });
    }

    // Permitir acceso a admin y caja
    if (!['admin', 'caja'].includes(user.rol)) {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 });
    }

    const db = getDb();
    const meseros = db.prepare(`
      SELECT id, username, nombre, activo as estado, creado_en
      FROM usuarios
      WHERE rol = 'mesero'
      ORDER BY nombre ASC
    `).all();

    return NextResponse.json(meseros);
  } catch (error) {
    console.error('Error fetching meseros:', error);
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
    if (!user || !['admin', 'caja'].includes(user.rol)) {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 });
    }

    const { username, password, nombre } = await request.json();

    if (!username || !password || !nombre) {
      return NextResponse.json(
        { message: 'Todos los campos son requeridos' },
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

    // Insertar el nuevo mesero
    const result = db.prepare(
      'INSERT INTO usuarios (username, password, rol, nombre) VALUES (?, ?, ?, ?)'
    ).run(username, hashedPassword, 'mesero', nombre);

    return NextResponse.json({
      message: 'Mesero creado exitosamente',
      id: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Error creating mesero:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}