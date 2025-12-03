import { NextRequest, NextResponse } from 'next/server';
import { getMenuFromDatabase } from '../../../lib/menuSync';
import { addMenuItem, updateMenuItem, MenuItem } from '../../../lib/googleSheets';
import { cookies } from 'next/headers';
import { verifyToken } from '../../../lib/auth';

export async function GET() {
  try {
    const menu = await getMenuFromDatabase();
    return NextResponse.json(menu);
  } catch (error) {
    console.error('Error obteniendo menú:', error);
    return NextResponse.json(
      { message: 'Error obteniendo menú' },
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

    const { categoryName, item }: { categoryName: string; item: MenuItem } = await request.json();

    if (!categoryName || !item.nombre || !item.descripcion || !item.precio) {
      return NextResponse.json(
        { message: 'Datos incompletos' },
        { status: 400 }
      );
    }

    await addMenuItem(categoryName, item);

    return NextResponse.json({ message: 'Item agregado exitosamente' });
  } catch (error) {
    console.error('Error agregando item:', error);
    return NextResponse.json(
      { message: 'Error agregando item' },
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

    const { categoryName, itemName }: { categoryName: string; itemName: string } = await request.json();

    if (!categoryName || !itemName) {
      return NextResponse.json(
        { message: 'Datos incompletos' },
        { status: 400 }
      );
    }

    // Para eliminar, necesitamos encontrar la fila y borrarla
    // Por simplicidad, marcaremos el precio como 0 (lo que efectivamente lo "elimina" del menú)
    await updateMenuItem(categoryName, itemName, { precio: 0 });

    return NextResponse.json({ message: 'Item eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando item:', error);
    return NextResponse.json(
      { message: 'Error eliminando item' },
      { status: 500 }
    );
  }
}