import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Create a response that allows the request to proceed
  const response = NextResponse.next();

  // Ensure cookies are included in the response for client-side RSC fetches
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  
  // Anti-cache headers para asegurar que se vean los cambios
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  return response;
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*', '/atiendemesero/:path*', '/comanda/:path*'],
};