/**
 * CUENTAS BY ID API ROUTE - REFACTORIZADO
 * Usa la capa de servicios centralizada
 */

import { NextRequest } from 'next/server';
import cuentasService from '@/lib/services/cuentas.service';
import ResponseHandler from '@/lib/response-handler';
import { getDb } from '@/lib/db';

// GET - Obtener cuenta específica con todos sus detalles
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cuentaId = parseInt(params.id);

    if (!cuentaId || cuentaId <= 0) {
      return ResponseHandler.badRequest('ID de cuenta inválido');
    }

    const result = await cuentasService.getCuentaCompleta(cuentaId);

    if (!result.success) {
      return ResponseHandler.error(result.error || 'Cuenta no encontrada', 404);
    }

    if (!result.data) {
      return ResponseHandler.notFound('Cuenta no encontrada');
    }

    return ResponseHandler.success(result.data);
  } catch (error) {
    return ResponseHandler.internalError('Error al obtener cuenta', error);
  }
}

// PUT/PATCH - Actualizar cuenta (estado, mesero, mesa, etc.)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cuentaId = parseInt(params.id);

    if (!cuentaId || cuentaId <= 0) {
      return ResponseHandler.badRequest('ID de cuenta inválido');
    }

    const body = await request.json();
    const { estado, metodo_pago, total_cobrado, mesa_numero, mesero_id } = body;

    const db = getDb();

    // Si se está actualizando estado a cerrada o cobrada
    if (estado && (estado === 'cerrada' || estado === 'cobrada')) {
      let result;
      
      if (estado === 'cerrada') {
        result = await cuentasService.cerrarCuenta(cuentaId);
        if (result.success) {
          return ResponseHandler.success(result.data, 'Cuenta cerrada exitosamente');
        }
      } else if (estado === 'cobrada') {
        if (!metodo_pago) {
          return ResponseHandler.badRequest('Se requiere método de pago');
        }
        result = await cuentasService.cobrarCuenta(cuentaId, metodo_pago, total_cobrado);
        if (result.success) {
          return ResponseHandler.success(result.data, 'Cuenta cobrada exitosamente');
        }
      }

      if (!result.success) {
        return ResponseHandler.error(result.error || 'Error al actualizar cuenta', 500);
      }

      return ResponseHandler.success(result.data);
    }

    // Actualización simple de campos (mesa, mesero, estado abierta)
    const updates: string[] = [];
    const values: any[] = [];

    if (mesa_numero !== undefined) {
      updates.push('mesa_numero = ?');
      values.push(mesa_numero);
    }

    if (mesero_id !== undefined) {
      updates.push('mesero_id = ?');
      values.push(mesero_id);
    }

    if (estado !== undefined && estado !== 'cerrada' && estado !== 'cobrada') {
      updates.push('estado = ?');
      values.push(estado);
    }

    if (updates.length === 0) {
      return ResponseHandler.badRequest('No hay campos para actualizar');
    }

    values.push(cuentaId);

    db.prepare(`
      UPDATE cuentas
      SET ${updates.join(', ')}
      WHERE id = ?
    `).run(...values);

    const updatedCuenta = db.prepare('SELECT * FROM cuentas WHERE id = ?').get(cuentaId);

    return ResponseHandler.success(updatedCuenta, 'Cuenta actualizada exitosamente');
  } catch (error) {
    return ResponseHandler.internalError('Error al actualizar cuenta', error);
  }
}

// PATCH - Alias para PUT
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  return PUT(request, { params });
}

// DELETE - Eliminar cuenta (solo si está abierta)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cuentaId = parseInt(params.id);

    if (!cuentaId || cuentaId <= 0) {
      return ResponseHandler.badRequest('ID de cuenta inválido');
    }

    const result = await cuentasService.eliminarCuenta(cuentaId);

    if (!result.success) {
      return ResponseHandler.error(result.error || 'Error al eliminar cuenta', 500);
    }

    return ResponseHandler.success(result.data, 'Cuenta eliminada exitosamente');
  } catch (error) {
    return ResponseHandler.internalError('Error al eliminar cuenta', error);
  }
}
