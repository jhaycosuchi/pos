import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');

    let query = `
      SELECT id, numero, capacidad, estado, ubicacion, mesero_id, creado_en
      FROM mesas
    `;

    if (estado) {
      query += ` WHERE estado = ?`;
    }

    query += ` ORDER BY CAST(numero AS INTEGER) ASC`;

    const stmt = db.prepare(query);
    const mesas = estado ? stmt.all(estado) : stmt.all();

    return NextResponse.json(mesas);
  } catch (error) {
    console.error('Error fetching mesas:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { numero, capacidad } = await request.json();

    if (!numero || !capacidad) {
      return NextResponse.json(
        { message: 'número y capacidad son requeridos' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verificar si la mesa ya existe
    const existingMesa = db.prepare('SELECT id FROM mesas WHERE numero = ?').get(numero);
    if (existingMesa) {
      return NextResponse.json(
        { message: 'La mesa ya existe' },
        { status: 400 }
      );
    }

    // Insertar nueva mesa
    const result = db.prepare(
      'INSERT INTO mesas (numero, capacidad, estado) VALUES (?, ?, ?)'
    ).run(numero, capacidad, 'disponible');

    return NextResponse.json({
      message: 'Mesa creada exitosamente',
      id: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Error creating mesa:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
