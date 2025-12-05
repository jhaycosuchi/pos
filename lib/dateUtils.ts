/**
 * Utilidades para manejar fechas en zona horaria de México (UTC-6 / UTC-5)
 */

const MEXICO_TIMEZONE = 'America/Mexico_City';

// Almacenar el desfase de tiempo entre cliente y servidor
let clientServerOffset = 0;
let offsetCalculated = false;

/**
 * Obtiene la hora actual sincronizada con el servidor
 */
export async function getNowSyncedWithServer(): Promise<Date> {
  if (!offsetCalculated) {
    try {
      const response = await fetch('/pos/api/time');
      const data = await response.json();
      // data.timestamp es milisegundos desde epoch (UTC)
      const serverTime = new Date(data.timestamp);
      const clientTime = new Date();
      clientServerOffset = serverTime.getTime() - clientTime.getTime();
      offsetCalculated = true;
      console.log('Hora sincronizada con servidor. Offset:', clientServerOffset, 'ms');
    } catch (error) {
      console.error('Error sincronizando hora con servidor:', error);
      offsetCalculated = true; // No reintentar
      clientServerOffset = 0; // Usar hora local como fallback
    }
  }
  
  return new Date(new Date().getTime() + clientServerOffset);
}

/**
 * Obtiene la hora actual en el navegador (usar solo para display, NO para cálculos)
 */
function getNowClient(): Date {
  return new Date();
}

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
 * IMPORTANTE: Debe usarse con la hora sincronizada del servidor para evitar discrepancias
 * por zona horaria del cliente
 */
export function calcularMinutosTranscurridos(dateStr: string, nowDate?: Date): number {
  try {
    if (!dateStr) return 0;
    
    let date: Date;
    
    // Soportar formato "2025-12-04 22:31:58" (con espacio en lugar de T)
    if (dateStr.includes(' ') && !dateStr.includes('T') && !dateStr.includes('Z')) {
      date = new Date(dateStr.replace(' ', 'T') + 'Z');
    } else if (!dateStr.includes('Z') && !dateStr.includes('+') && !dateStr.includes('-', 10)) {
      date = new Date(dateStr + 'Z');
    } else {
      date = new Date(dateStr);
    }
    
    if (isNaN(date.getTime())) return 0;
    
    // Usar hora sincronizada del servidor si se proporciona
    // Si no, usar la hora actual (será del cliente, pero mejor que nada)
    const ahora = nowDate || new Date();
    const minutos = Math.floor((ahora.getTime() - date.getTime()) / 60000);
    return Math.max(0, minutos); // Retornar 0 si el resultado es negativo
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
