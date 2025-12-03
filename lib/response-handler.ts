/**
 * RESPONSE HANDLER
 * Maneja todas las respuestas de la API de forma uniforme
 */

import { NextResponse } from 'next/server';
import type { ApiResponse } from './services/base.service';

export class ResponseHandler {
  /**
   * Respuesta JSON uniforme
   */
  static json<T>(response: ApiResponse<T>) {
    return NextResponse.json(
      {
        success: response.success,
        ...(response.data !== undefined && { data: response.data }),
        ...(response.message && { message: response.message }),
        ...(response.error && { error: response.error }),
      },
      { status: response.statusCode }
    );
  }

  /**
   * Respuesta exitosa
   */
  static success<T>(data: T, message?: string, statusCode = 200) {
    return this.json({
      success: true,
      data,
      message,
      statusCode,
    });
  }

  /**
   * Respuesta de error
   */
  static error(message: string, statusCode = 500, error?: any) {
    if (error) {
      console.error(`[API Error ${statusCode}]`, message, error);
    } else {
      console.error(`[API Error ${statusCode}]`, message);
    }

    return this.json({
      success: false,
      error: message,
      message,
      statusCode,
    });
  }

  /**
   * Not found
   */
  static notFound(message = 'Recurso no encontrado') {
    return this.error(message, 404);
  }

  /**
   * Bad request
   */
  static badRequest(message = 'Solicitud inválida') {
    return this.error(message, 400);
  }

  /**
   * Unauthorized
   */
  static unauthorized(message = 'No autorizado') {
    return this.error(message, 401);
  }

  /**
   * Forbidden
   */
  static forbidden(message = 'Acceso denegado') {
    return this.error(message, 403);
  }

  /**
   * Internal server error
   */
  static internalError(message = 'Error interno del servidor', error?: any) {
    return this.error(message, 500, error);
  }
}

export default ResponseHandler;
