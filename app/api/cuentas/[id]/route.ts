/**
 * CUENTAS BY ID API ROUTE - REFACTORIZADO
 * Usa la capa de servicios centralizada
 */

import { NextRequest } from 'next/server';
import cuentasService from '@/lib/services/cuentas.service';
import ResponseHandler from '@/lib/response-handler';

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

// PUT/PATCH - Actualizar estado de cuenta (cerrar, cobrar)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cuentaId = parseInt(params.id);

    if (!cuentaId || cuentaId <= 0) {
      return ResponseHandler.badRequest('ID de cuenta inválido');
    }

    const body = await request.json();
    const { estado, metodo_pago, total_cobrado } = body;

    if (!estado) {
      return ResponseHandler.badRequest('Campo requerido: estado');
    }

    let result;

    if (estado === 'cerrada') {
      // Cerrar cuenta
      result = await cuentasService.cerrarCuenta(cuentaId);
      if (result.success) {
        return ResponseHandler.success(result.data, 'Cuenta cerrada exitosamente');
      }
    } else if (estado === 'cobrada') {
      // Cobrar cuenta
      if (!metodo_pago) {
        return ResponseHandler.badRequest('Se requiere método de pago');
      }

      result = await cuentasService.cobrarCuenta(cuentaId, metodo_pago, total_cobrado);
      if (result.success) {
        return ResponseHandler.success(result.data, 'Cuenta cobrada exitosamente');
      }
    } else {
      return ResponseHandler.badRequest(`Estado inválido: ${estado}`);
    }

    if (!result.success) {
      return ResponseHandler.error(result.error || 'Error al actualizar cuenta', 500);
    }

    return ResponseHandler.success(result.data);
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
