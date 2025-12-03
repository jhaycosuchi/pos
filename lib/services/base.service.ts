/**
 * BASE SERVICE
 * Capa centralizada para todas las operaciones de base de datos
 * Esto previene duplicación de código y errores en cada endpoint
 */

import { getDb } from '../db';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode: number;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  where?: Record<string, any>;
}

export class BaseService {
  protected db = getDb();

  /**
   * Respuesta exitosa estándar
   */
  success<T>(data: T, message?: string, statusCode = 200): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      statusCode,
    };
  }

  /**
   * Respuesta de error estándar
   */
  error(message: string, statusCode = 500, error?: any): ApiResponse {
    console.error(`[API Error ${statusCode}]`, message, error);
    return {
      success: false,
      error: message,
      message,
      statusCode,
    };
  }

  /**
   * Validar que un ID sea válido
   */
  validateId(id: any): { valid: boolean; id?: number; error?: string } {
    const parsedId = parseInt(id);
    if (!parsedId || parsedId <= 0) {
      return {
        valid: false,
        error: 'ID inválido',
      };
    }
    return { valid: true, id: parsedId };
  }

  /**
   * Validar que un objeto tenga campos requeridos
   */
  validateRequiredFields(obj: any, fields: string[]): { valid: boolean; error?: string } {
    const missing = fields.filter((f) => !obj[f] || obj[f] === '');
    if (missing.length > 0) {
      return {
        valid: false,
        error: `Campos requeridos: ${missing.join(', ')}`,
      };
    }
    return { valid: true };
  }

  /**
   * Ejecutar query con manejo de errores
   */
  async runQuery<T>(
    callback: () => T,
    errorMessage = 'Error en la base de datos'
  ): Promise<ApiResponse<T>> {
    try {
      const data = callback();
      return this.success(data, undefined, 200);
    } catch (err: any) {
      console.error('[DB Error]', err);
      return this.error(errorMessage, 500, err);
    }
  }

  /**
   * Encontrar registro por ID (seguro)
   */
  findById(table: string, id: number): any | null {
    try {
      return this.db
        .prepare(`SELECT * FROM ${this.escapeTableName(table)} WHERE id = ?`)
        .get(id);
    } catch (err) {
      return null;
    }
  }

  /**
   * Encontrar todos los registros
   */
  findAll(table: string, options?: QueryOptions): any[] {
    try {
      let query = `SELECT * FROM ${this.escapeTableName(table)}`;

      if (options?.where) {
        const conditions = Object.entries(options.where)
          .map(([key, value]) => {
            if (value === null) {
              return `${key} IS NULL`;
            }
            return `${key} = '${String(value).replace(/'/g, "''")}'`;
          })
          .join(' AND ');
        query += ` WHERE ${conditions}`;
      }

      if (options?.orderBy) {
        query += ` ORDER BY ${options.orderBy}`;
      }

      if (options?.limit) {
        query += ` LIMIT ${options.limit}`;
      }

      if (options?.offset) {
        query += ` OFFSET ${options.offset}`;
      }

      return this.db.prepare(query).all();
    } catch (err) {
      return [];
    }
  }

  /**
   * Contar registros
   */
  count(table: string, where?: Record<string, any>): number {
    try {
      let query = `SELECT COUNT(*) as count FROM ${this.escapeTableName(table)}`;

      if (where) {
        const conditions = Object.entries(where)
          .map(([key, value]) => `${key} = '${String(value).replace(/'/g, "''")}'`)
          .join(' AND ');
        query += ` WHERE ${conditions}`;
      }

      const result = this.db.prepare(query).get() as any;
      return result?.count || 0;
    } catch (err) {
      return 0;
    }
  }

  /**
   * Escapar nombre de tabla (seguridad)
   */
  protected escapeTableName(table: string): string {
    // Solo permite nombres alfanuméricos y underscore
    if (!/^[a-zA-Z0-9_]+$/.test(table)) {
      throw new Error(`Nombre de tabla inválido: ${table}`);
    }
    return table;
  }
}

export default BaseService;
