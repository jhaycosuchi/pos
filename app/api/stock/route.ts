import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '../../../lib/auth';
import {
  marcarFueraDeStock,
  restaurarStock,
  obtenerDisponibilidad,
  obtenerProductosSinStock,
  limpiarStockExpirado
} from '../../../lib/stock';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo') || 'lista';
    const menu_item_id = searchParams.get('menu_item_id');

    // Limpiar stock expirado automáticamente
    await limpiarStockExpirado();

    if (tipo === 'lista') {
      // Obtener lista de productos sin stock
      const productos = await obtenerProductosSinStock();
      return NextResponse.json({ success: true, data: productos });
    }

    if (tipo === 'disponibilidad' && menu_item_id) {
      // Verificar disponibilidad de un producto específico
      const disponible = await obtenerDisponibilidad(parseInt(menu_item_id));
      return NextResponse.json({ success: true, disponible });
    }

    return NextResponse.json(
      { message: 'Parámetro tipo inválido' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error en GET /api/stock:', error);
    return NextResponse.json(
      { message: 'Error obteniendo stock', error: error instanceof Error ? error.message : String(error) },
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
      return NextResponse.json({ message: 'Acceso denegado - solo admin' }, { status: 403 });
    }

    const body = await request.json();
    const { accion, menu_item_id, razon, duracion_horas } = body;

    if (accion === 'marcar-sin-stock') {
      if (!menu_item_id) {
        return NextResponse.json(
          { message: 'Falta menu_item_id' },
          { status: 400 }
        );
      }

      await marcarFueraDeStock(
        menu_item_id,
        razon || 'Temporalmente no disponible',
        duracion_horas || 24,
        user.id
      );

      return NextResponse.json({ 
        success: true,
        message: `Producto marcado como sin stock por ${duracion_horas || 24} horas`
      });
    }

    if (accion === 'restaurar-stock') {
      if (!menu_item_id) {
        return NextResponse.json(
          { message: 'Falta menu_item_id' },
          { status: 400 }
        );
      }

      await restaurarStock(menu_item_id);

      return NextResponse.json({ 
        success: true,
        message: 'Producto restaurado a disponible'
      });
    }

    return NextResponse.json(
      { message: 'Acción no válida' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error en POST /api/stock:', error);
    return NextResponse.json(
      { message: 'Error actualizando stock', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
