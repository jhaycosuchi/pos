/**
 * Utilidades para manejar fechas en zona horaria de México (UTC-6 / UTC-5)
 */

const MEXICO_TIMEZONE = 'America/Mexico_City';

/**
 * Convierte una fecha a formato legible en hora México
 */
export function formatDateMexico(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleString('es-MX', {
      timeZone: MEXICO_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (error) {
    return dateStr;
  }
}

/**
 * Convierte una fecha solo la parte de fecha (sin hora)
 */
export function formatDateOnlyMexico(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX', {
      timeZone: MEXICO_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    return dateStr;
  }
}

/**
 * Convierte una fecha solo la parte de hora
 */
export function formatTimeOnlyMexico(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-MX', {
      timeZone: MEXICO_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (error) {
    return dateStr;
  }
}

/**
 * Calcula tiempo transcurrido desde una fecha en formato legible
 */
export function calcularTiempoTranscurrido(dateStr: string): string {
  try {
    if (!dateStr) return 'sin fecha';
    
    // Parsear la fecha - si viene de SQLite puede ser sin timezone
    let date: Date;
    
    // Si la fecha no tiene timezone info, asumimos que es UTC
    if (!dateStr.includes('Z') && !dateStr.includes('+') && !dateStr.includes('-', 10)) {
      date = new Date(dateStr + 'Z'); // Agregar Z para interpretarla como UTC
    } else {
      date = new Date(dateStr);
    }
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      console.error('Fecha inválida:', dateStr);
      return 'fecha inválida';
    }
    
    const ahora = new Date();
    const diferencia = Math.floor((ahora.getTime() - date.getTime()) / 1000); // segundos
    
    if (diferencia < 0) return 'recién';
    if (diferencia < 60) return `hace ${diferencia}s`;
    
    const minutos = Math.floor(diferencia / 60);
    if (minutos === 1) return 'hace 1 min';
    if (minutos < 60) return `hace ${minutos} min`;
    
    const horas = Math.floor(minutos / 60);
    if (horas === 1) return 'hace 1 hora';
    if (horas < 24) return `hace ${horas} horas`;
    
    const dias = Math.floor(horas / 24);
    if (dias === 1) return 'ayer';
    if (dias < 7) return `hace ${dias} días`;
    
    return `hace ${Math.floor(dias / 7)} sem`;
  } catch (error) {
    console.error('Error calculando tiempo:', error, dateStr);
    return 'error';
  }
}

/**
 * Calcula los minutos transcurridos desde una fecha (para determinar colores)
 */
export function calcularMinutosTranscurridos(dateStr: string): number {
  try {
    if (!dateStr) return 0;
    
    let date: Date;
    if (!dateStr.includes('Z') && !dateStr.includes('+') && !dateStr.includes('-', 10)) {
      date = new Date(dateStr + 'Z');
    } else {
      date = new Date(dateStr);
    }
    
    if (isNaN(date.getTime())) return 0;
    
    const ahora = new Date();
    return Math.floor((ahora.getTime() - date.getTime()) / 60000);
  } catch (error) {
    return 0;
  }
}

/**
 * Obtiene la hora actual en México
 */
export function getNowMexico(): Date {
  const now = new Date();
  const mexicoTime = new Date(now.toLocaleString('en-US', { timeZone: MEXICO_TIMEZONE }));
  return mexicoTime;
}
