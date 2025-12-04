import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Create a response that allows the request to proceed
  const response = NextResponse.next();

  // Ensure cookies are included in the response for client-side RSC fetches
  // This allows the browser to send cookies with subsequent requests
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  return response;
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*'],
};