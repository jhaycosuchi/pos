import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '../../../lib/auth';
import {
  calcularVentasDiarias,
  obtenerReporteVentas,
  calcularKpisMensuales,
  obtenerKpisMensuales,
  obtenerPerformanceMeseros,
  obtenerProductosMasVendidos,
} from '../../../lib/reportes';
import { migrateReportsTables } from '../../../lib/migrateReports';

export async function GET(request: NextRequest) {
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

    // Obtener parámetros
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo') || 'kpis-mensuales';
    const anio = parseInt(searchParams.get('anio') || new Date().getFullYear().toString());
    const mes = searchParams.get('mes') ? parseInt(searchParams.get('mes')!) : undefined;
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');

    try {
      if (tipo === 'kpis-mensuales') {
        const kpis = obtenerKpisMensuales(anio, mes);
        return NextResponse.json({ success: true, data: kpis });
      }

      if (tipo === 'ventas-diarias' && fechaInicio && fechaFin) {
        const ventas = obtenerReporteVentas(fechaInicio, fechaFin);
        return NextResponse.json({ success: true, data: ventas });
      }

      if (tipo === 'performance-meseros' && fechaInicio && fechaFin) {
        const performance = obtenerPerformanceMeseros(fechaInicio, fechaFin);
        return NextResponse.json({ success: true, data: performance });
      }

      if (tipo === 'productos-top' && fechaInicio && fechaFin) {
        const limit = parseInt(searchParams.get('limit') || '10');
        const productos = obtenerProductosMasVendidos(fechaInicio, fechaFin, limit);
        return NextResponse.json({ success: true, data: productos });
      }

      return NextResponse.json(
        { message: 'Parámetro tipo inválido o falta información requerida' },
        { status: 400 }
      );
    } catch (queryError) {
      console.error(`Error en query ${tipo}:`, queryError);
      return NextResponse.json(
        {
          success: false,
          message: `Error procesando ${tipo}`,
          data: [],
        },
        { status: 200 } // Retornamos 200 con data vacío en lugar de 500
      );
    }
  } catch (error) {
    console.error('Error obteniendo reportes:', error);
    return NextResponse.json(
      { message: 'Error obteniendo reportes', error: error instanceof Error ? error.message : String(error) },
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

    const body = await request.json();
    const { accion } = body;

    if (accion === 'inicializar-reportes') {
      // Crear tablas de reportes
      await migrateReportsTables();
      return NextResponse.json({ message: 'Tablas de reportes inicializadas exitosamente' });
    }

    if (accion === 'calcular-ventas-hoy') {
      // Calcular ventas del día actual
      const hoy = new Date().toISOString().split('T')[0];
      await calcularVentasDiarias(hoy);
      return NextResponse.json({ message: 'Ventas del día calculadas exitosamente' });
    }

    if (accion === 'calcular-ventas-fecha') {
      // Calcular ventas de una fecha específica
      const { fecha } = body;
      if (!fecha) {
        return NextResponse.json({ message: 'Falta el parámetro fecha' }, { status: 400 });
      }
      await calcularVentasDiarias(fecha);
      return NextResponse.json({ message: `Ventas del ${fecha} calculadas exitosamente` });
    }

    if (accion === 'calcular-kpis-mes') {
      // Calcular KPIs de un mes específico
      const { anio, mes } = body;
      if (!anio || !mes) {
        return NextResponse.json({ message: 'Faltan parámetros anio o mes' }, { status: 400 });
      }
      await calcularKpisMensuales(anio, mes);
      return NextResponse.json({ message: `KPIs de ${anio}-${mes} calculados exitosamente` });
    }

    return NextResponse.json({ message: 'Acción no válida' }, { status: 400 });
  } catch (error) {
    console.error('Error procesando acción de reportes:', error);
    return NextResponse.json(
      { message: 'Error procesando acción', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
