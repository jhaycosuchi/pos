/**
 * CUENTAS API ROUTE - REFACTORIZADO
 * Usa la capa de servicios centralizada
 */

import { NextRequest, NextResponse } from 'next/server';
import cuentasService from '@/lib/services/cuentas.service';
import ResponseHandler from '@/lib/response-handler';

// GET - Obtener cuentas (con filtros opcionales)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const tipo = searchParams.get('tipo'); // 'mesa' o 'llevar'

    const result = await cuentasService.getCuentas(estado || undefined, tipo || undefined);

    if (!result.success) {
      return ResponseHandler.error(result.error || 'Error al obtener cuentas', 500);
    }

    return ResponseHandler.success(result.data || []);
  } catch (error) {
    return ResponseHandler.internalError('Error al obtener cuentas', error);
  }
}

// POST - Crear nueva cuenta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar datos requeridos
    if (!body.numero_cuenta || !body.estado) {
      return ResponseHandler.badRequest('Faltan campos requeridos: numero_cuenta, estado');
    }

    const result = await cuentasService.crearCuenta({
      numero_cuenta: body.numero_cuenta,
      mesa_numero: body.mesa_numero,
      mesero_id: body.mesero_id,
      estado: body.estado,
    });

    if (!result.success) {
      return ResponseHandler.error(result.error || 'Error al crear cuenta', 500);
    }

    return ResponseHandler.success(result.data, 'Cuenta creada exitosamente', 201);
  } catch (error) {
    return ResponseHandler.internalError('Error al crear cuenta', error);
  }
}
