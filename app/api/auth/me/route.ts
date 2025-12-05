import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';

/**
 * GET /api/auth/me
 * Devuelve el usuario actual desde la sesión
 * Por ahora devuelve un usuario por defecto (mesero ID 4)
 * En el futuro podría usar cookies/sessions reales
 */
export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    
    // Por ahora, obtener un mesero por defecto (ID 4)
    // En el futuro esto podría venir de cookies o sesiones reales
    const meseroId = 4;
    
    const mesero = db.prepare(`
      SELECT id, nombre, rol FROM usuarios WHERE id = ?
    `).get(meseroId);

    if (!mesero) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: mesero
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor', error: String(error) },
      { status: 500 }
    );
  }
}
