import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory rate limiting (for production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests per window
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  if (record.count >= RATE_LIMIT) {
    return true;
  }
  
  record.count++;
  return false;
}

function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters
  return input.replace(/[<>\"'&]/g, '');
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for Next.js internal assets, development files, and static assets
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('favicon') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.woff2') ||
    pathname.endsWith('.woff') ||
    pathname.endsWith('.ttf') ||
    pathname.endsWith('.map') ||
    pathname.endsWith('.ico') ||
    pathname === '/service-worker.js' ||
    pathname === '/sw.js' ||
    pathname === '/manifest.json' ||
    pathname.startsWith('/public/') ||
    pathname.startsWith('/_vercel') ||
    pathname.includes('__nextjs')
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  
  // Rate limiting (only in production)
  if (process.env.NODE_ENV === 'production') {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    if (isRateLimited(ip)) {
      return new NextResponse(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
          }
        }
      );
    }
  }

  // Input validation for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const url = request.nextUrl;
    
    // Validate query parameters
    for (const [key, value] of url.searchParams.entries()) {
      if (typeof value === 'string' && value.length > 1000) {
        return new NextResponse(
          JSON.stringify({ error: 'Query parameter too long' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Validate path parameters
    const pathSegments = url.pathname.split('/');
    for (const segment of pathSegments) {
      if (segment.length > 100) {
        return new NextResponse(
          JSON.stringify({ error: 'Path parameter too long' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  }

  // CORS handling
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    'https://autovad.vercel.app',
    'https://mktfybjfxzhvpmnepshq.supabase.co',
    'https://stream.mux.com',
    'https://commondatastorage.googleapis.com',
    'https://images.unsplash.com',
    'https://images.pexels.com',
    'https://api.mux.com',
    'https://image.mux.com', // Add Mux image domain
  ];

  // Allow localhost in development
  if (process.env.NODE_ENV === 'development') {
    allowedOrigins.push('http://localhost:3000', 'http://127.0.0.1:3000');
  }

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    // Only set credentials for our own domain, not for external media sources
    if (origin.includes('localhost') || origin.includes('autovad.vercel.app')) {
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
  }

  // Enhanced Content Security Policy (relaxed for development)
  const isDev = process.env.NODE_ENV === 'development';
  const csp = [
    "default-src 'self'",
    isDev 
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://eu.i.posthog.com https://eu-assets.i.posthog.com https://vercel.live https://va.vercel-scripts.com"
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://eu.i.posthog.com https://eu-assets.i.posthog.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob: https://mktfybjfxzhvpmnepshq.supabase.co https://images.pexels.com https://images.unsplash.com https://stream.mux.com https://commondatastorage.googleapis.com https://image.mux.com",
    isDev 
      ? "media-src 'self' blob: https:"
      : "media-src 'self' blob: https: https://mktfybjfxzhvpmnepshq.supabase.co https://stream.mux.com https://commondatastorage.googleapis.com https://*.mux.com",
    isDev
      ? "connect-src 'self' https:"
      : "connect-src 'self' https: https://mktfybjfxzhvpmnepshq.supabase.co https://eu.i.posthog.com https://eu-assets.i.posthog.com https://stream.mux.com https://api.mux.com https://commondatastorage.googleapis.com https://*.mux.com",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    isDev ? "" : "upgrade-insecure-requests",
  ].filter(Boolean).join('; ');

  // Security headers (more permissive in development to allow external media)
  if (isDev) {
    response.headers.set('Content-Security-Policy-Report-Only', csp);
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    // Don't set COEP in development to allow external media like Mux thumbnails
  } else {
    response.headers.set('Content-Security-Policy', csp);
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()');
    // Don't set COEP in production either - it blocks Mux thumbnails
    // response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    // Don't set CORP either - allow cross-origin resources like Mux
    // response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  }
  
  // Common headers
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Client-Info, X-Platform, X-App-Version, X-Requested-With');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  // Remove server information
  response.headers.delete('X-Powered-By');
  response.headers.delete('Server');
  
  // Add security headers for tracking
  response.headers.set('X-Request-ID', `autovad-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)  
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/).*)',
  ],
}; 