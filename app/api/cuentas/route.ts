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

// PATCH - Actualizar cuenta (cambiar estado, etc)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar que se proporciona el ID
    if (!body.id) {
      return ResponseHandler.badRequest('Se requiere el ID de la cuenta');
    }

    // Construir objeto de actualización
    const updateData: any = {};
    if (body.estado) updateData.estado = body.estado;
    if (body.total !== undefined) updateData.total = body.total;
    if (body.mesa_numero) updateData.mesa_numero = body.mesa_numero;
    if (body.mesero_id) updateData.mesero_id = body.mesero_id;

    // Actualizar en la BD
    const { getDb } = await import('@/lib/db');
    const db = getDb();

    const updateFields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const updateValues = Object.values(updateData);
    
    if (updateFields.length === 0) {
      return ResponseHandler.badRequest('No hay campos para actualizar');
    }

    const stmt = db.prepare(
      `UPDATE cuentas SET ${updateFields}, actualizado_en = CURRENT_TIMESTAMP WHERE id = ?`
    );
    
    stmt.run(...updateValues, body.id);

    // Obtener la cuenta actualizada
    const updatedCuenta = db.prepare('SELECT * FROM cuentas WHERE id = ?').get(body.id);

    return ResponseHandler.success(updatedCuenta, 'Cuenta actualizada exitosamente');
  } catch (error) {
    return ResponseHandler.internalError('Error al actualizar cuenta', error);
  }
}
