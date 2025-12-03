import { NextResponse } from 'next/server';
import { migrateMenuTables } from '../../../lib/migrateMenu';
import { migrateReportesTables } from '../../../lib/migrateReportes';
import { migratePedidosTable } from '../../../lib/migratePedidos';

export async function POST() {
  try {
    migrateMenuTables();
    migrateReportesTables();
    migratePedidosTable();
    return NextResponse.json({ message: 'Migración completada exitosamente' });
  } catch (error) {
    console.error('Error en migración:', error);
    return NextResponse.json(
      { message: 'Error en migración', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}