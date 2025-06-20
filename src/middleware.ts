import { NextResponse } from 'next/server';

export function middleware() {
  const response = NextResponse.next();

  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "img-src 'self' data: https: mktfybjfxzhvpmnepshq.supabase.co images.pexels.com",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' https: data:",
      "connect-src 'self' https: mktfybjfxzhvpmnepshq.supabase.co"
    ].join('; ')
  );
  // HSTS
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  // X-Frame-Options
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Permissions Policy
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: [
    '/((?!_next|favicon.ico|assets|public).*)',
  ],
}; 