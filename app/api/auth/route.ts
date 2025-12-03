import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, generateToken, verifyToken } from '../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'No autenticado' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { message: 'Token inválido' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: decoded.id,
      username: decoded.username,
      rol: decoded.rol,
      nombre: decoded.nombre
    });
  } catch (error) {
    console.error('Error verificando token:', error);
    return NextResponse.json(
      { message: 'Error al verificar autenticación' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Usuario y contraseña requeridos' },
        { status: 400 }
      );
    }

    const user = await authenticateUser(username, password);

    if (!user) {
      return NextResponse.json(
        { message: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const token = generateToken(user);

    const response = NextResponse.json({
      message: 'Login exitoso',
      user: { id: user.id, username: user.username, rol: user.rol, nombre: user.nombre }
    });

    // Establecer cookie con el token
    response.cookies.set('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 8 * 60 * 60, // 8 horas
      path: '/pos',
    });

    return response;
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}