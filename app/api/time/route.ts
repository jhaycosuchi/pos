/**
 * Endpoint que devuelve la hora actual del servidor
 * Usado para sincronizar el reloj del cliente con el servidor
 * Retorna timestamp en milisegundos desde epoch (UTC)
 */

export async function GET() {
  try {
    const now = new Date();
    
    return new Response(
      JSON.stringify({
        timestamp: now.getTime(), // Milisegundos desde epoch
        iso: now.toISOString(),
        timezone: 'America/Mexico_City',
        date: now.toLocaleDateString('es-MX'),
        time: now.toLocaleTimeString('es-MX')
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error) {
    console.error('Error en /api/time:', error);
    return new Response(
      JSON.stringify({ error: 'Error obteniendo hora del servidor' }),
      { status: 500 }
    );
  }
}
