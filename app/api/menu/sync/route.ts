import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '../../../../lib/auth';
import { syncMenuFromGoogleSheets } from '../../../../lib/menuSync';
import { hasGoogleCredentials } from '../../../../lib/getEnv';

export async function POST() {
  try {
    // Verificar autenticación
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ message: 'Token inválido' }, { status: 401 });
    }
    
    // Permitir sincronización para usuarios autenticados (admin, mesero, etc)
    // Solo requiere autenticación válida

    console.log('Iniciando sincronización de menú...');
    console.log('Credenciales disponibles:', hasGoogleCredentials());
    
    // Si Google Sheets no está configurado, devolver success sin hacer nada
    if (!hasGoogleCredentials()) {
      console.log('Google Sheets no configurado, usando menú existente de base de datos');
      return NextResponse.json({ 
        message: 'Menú sincronizado exitosamente (usando base de datos local)',
        success: true,
        warning: 'Google Sheets no está configurado'
      });
    }

    await syncMenuFromGoogleSheets();
    console.log('Sincronización completada');

    return NextResponse.json({ 
      message: 'Menú sincronizado exitosamente',
      success: true 
    });
  } catch (error) {
    console.error('Error sincronizando menú:', error);
    return NextResponse.json(
      { 
        message: 'Error sincronizando menú',
        error: error instanceof Error ? error.message : String(error),
        success: false
      },
      { status: 500 }
    );
  }
}