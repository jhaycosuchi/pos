import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getDb } from './db';
import { User, UserRole } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_jwt_secret';

// Exportar User para uso en componentes
export type { User };

export async function authenticateUser(username: string, password: string): Promise<User | null> {
  try {
    const db = getDb();
    const user = db.prepare('SELECT * FROM usuarios WHERE username = ? AND activo = 1').get(username) as any;

    if (!user) return null;

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return null;

    return {
      id: user.id,
      username: user.username,
      rol: user.rol as UserRole,
      nombre: user.nombre,
      estado: Boolean(user.estado),
      creado_en: user.creado_en,
    };
  } catch (error) {
    console.error('Error in authenticateUser:', error);
    return null;
  }
}

export function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, username: user.username, rol: user.rol },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
}

export function verifyToken(token: string): User | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      id: decoded.id,
      username: decoded.username,
      rol: decoded.rol as UserRole,
      nombre: decoded.nombre,
      estado: true, // Asumimos que si el token es válido, el usuario está activo
      creado_en: '', // No necesitamos esta info en el token
    };
  } catch {
    return null;
  }
}