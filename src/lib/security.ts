import { NextRequest } from 'next/server';

// Security constants
export const SECURITY_CONFIG = {
  MAX_QUERY_LENGTH: 1000,
  MAX_PATH_LENGTH: 100,
  MAX_BODY_SIZE: 1024 * 1024, // 1MB
  ALLOWED_ORIGINS: [
    'https://autovad.vercel.app', 
    'https://mktfybjfxzhvpmnepshq.supabase.co',
    'https://stream.mux.com',
    'https://commondatastorage.googleapis.com',
    'https://images.unsplash.com',
    'https://images.pexels.com',
    'https://api.mux.com'
  ],
  RATE_LIMIT: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 100,
  },
  // Web specific
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB for videos
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB for images
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/quicktime', 'video/avi'],
} as const;

// Input validation and sanitization
export class SecurityValidator {
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') return '';
    return input
      .trim()
      .replace(/[<>\"'&]/g, '')
      .substring(0, SECURITY_CONFIG.MAX_QUERY_LENGTH);
  }

  static validateUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  static validateNumericId(id: string): boolean {
    return /^\d+$/.test(id) && parseInt(id) > 0;
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static validateQueryParams(params: URLSearchParams): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    for (const [key, value] of params.entries()) {
      if (value.length > SECURITY_CONFIG.MAX_QUERY_LENGTH) {
        errors.push(`Query parameter ${key} too long`);
      }
      
      // Check for potential injection patterns
      if (/[<>\"'&]/.test(value)) {
        errors.push(`Query parameter ${key} contains invalid characters`);
      }
    }
    
    return { valid: errors.length === 0, errors };
  }

  static validateRequestBody(body: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!body || typeof body !== 'object') {
      errors.push('Invalid request body');
      return { valid: false, errors };
    }
    
    // Check for circular references
    try {
      JSON.stringify(body);
    } catch {
      errors.push('Invalid JSON structure');
    }
    
    // Check body size (approximate)
    const bodySize = JSON.stringify(body).length;
    if (bodySize > SECURITY_CONFIG.MAX_BODY_SIZE) {
      errors.push('Request body too large');
    }
    
    return { valid: errors.length === 0, errors };
  }
}

// CORS validation
export class CORSValidator {
  static validateOrigin(origin: string | null): boolean {
    if (!origin) return false;
    return SECURITY_CONFIG.ALLOWED_ORIGINS.includes(origin as any);
  }

  static getCORSHeaders(origin: string | null) {
    const headers: Record<string, string> = {
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400',
    };

    if (origin && this.validateOrigin(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Access-Control-Allow-Credentials'] = 'true';
    }

    return headers;
  }
}

// Rate limiting (in-memory - use Redis in production)
class RateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();

  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const record = this.requests.get(identifier);
    
    if (!record || now > record.resetTime) {
      this.requests.set(identifier, { 
        count: 1, 
        resetTime: now + SECURITY_CONFIG.RATE_LIMIT.WINDOW_MS 
      });
      return false;
    }
    
    if (record.count >= SECURITY_CONFIG.RATE_LIMIT.MAX_REQUESTS) {
      return true;
    }
    
    record.count++;
    return false;
  }

  getRemainingRequests(identifier: string): number {
    const record = this.requests.get(identifier);
    if (!record) return SECURITY_CONFIG.RATE_LIMIT.MAX_REQUESTS;
    return Math.max(0, SECURITY_CONFIG.RATE_LIMIT.MAX_REQUESTS - record.count);
  }

  getResetTime(identifier: string): number {
    const record = this.requests.get(identifier);
    return record?.resetTime || 0;
  }
}

export const rateLimiter = new RateLimiter();

// Security headers helper
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
  };
}

// Request validation helper
export function validateApiRequest(request: NextRequest): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate query parameters
  const queryValidation = SecurityValidator.validateQueryParams(request.nextUrl.searchParams);
  if (!queryValidation.valid) {
    errors.push(...queryValidation.errors);
  }
  
  // Validate path parameters
  const pathSegments = request.nextUrl.pathname.split('/');
  for (const segment of pathSegments) {
    if (segment.length > SECURITY_CONFIG.MAX_PATH_LENGTH) {
      errors.push('Path parameter too long');
      break;
    }
  }
  
  // Validate origin for CORS
  const origin = request.headers.get('origin');
  if (origin && !CORSValidator.validateOrigin(origin)) {
    errors.push('Invalid origin');
  }
  
  return { valid: errors.length === 0, errors };
}

// Error response helper
export function createErrorResponse(message: string, status: number = 400) {
  return new Response(
    JSON.stringify({ 
      success: false, 
      error: message,
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...getSecurityHeaders(),
      },
    }
  );
}

// Success response helper
export function createSuccessResponse(data: any, status: number = 200) {
  return new Response(
    JSON.stringify({ 
      success: true, 
      data,
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...getSecurityHeaders(),
      },
    }
  );
} 