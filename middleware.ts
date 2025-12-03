import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Por ahora, permitir todas las rutas
  // La autenticación se manejará en las páginas individuales
  return NextResponse.next();
}

export const config = {
  matcher: [],
};