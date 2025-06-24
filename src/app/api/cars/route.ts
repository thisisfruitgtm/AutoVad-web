import { NextRequest, NextResponse } from 'next/server';
import { 
  SecurityValidator, 
  rateLimiter, 
  validateApiRequest, 
  createErrorResponse, 
  createSuccessResponse,
  getSecurityHeaders 
} from '@/lib/security';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Simple in-memory rate limit (per process, not distributed)
const RATE_LIMIT = 30; // requests per minute
const rateLimitMap = new Map<string, { count: number; last: number }>();

function isRateLimited(ip: string) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const entry = rateLimitMap.get(ip) || { count: 0, last: now };
  if (now - entry.last > windowMs) {
    rateLimitMap.set(ip, { count: 1, last: now });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  rateLimitMap.set(ip, { count: entry.count + 1, last: entry.last });
  return false;
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    if (rateLimiter.isRateLimited(ip)) {
      return createErrorResponse('Rate limit exceeded', 429);
    }

    // Validate request
    const validation = validateApiRequest(request);
    if (!validation.valid) {
      return createErrorResponse(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Enhanced input validation
    if (query) {
      const sanitizedQuery = SecurityValidator.sanitizeString(query);
      if (sanitizedQuery !== query) {
        return createErrorResponse('Invalid query parameter');
      }
      
      if (!/^[\w\s-]{0,50}$/.test(query)) {
        return createErrorResponse('Invalid query format');
      }
    }
    
    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 50) {
      return createErrorResponse('Invalid pagination parameters');
    }
    
    const offset = (page - 1) * limit;
    
    // Build secure Supabase query
    let url = `${SUPABASE_URL}/rest/v1/cars?select=id,make,model,year,price,mileage,color,fuel_type,transmission,body_type,description,location,status,created_at,likes_count,comments_count,images,videos&order=created_at.desc&limit=${limit}&offset=${offset}`;
    
    if (query) {
      const encodedQuery = encodeURIComponent(query);
      url = `${SUPABASE_URL}/rest/v1/cars?select=id,make,model,year,price,mileage,color,fuel_type,transmission,body_type,description,location,status,created_at,likes_count,comments_count,images,videos&or=(make.ilike.%25${encodedQuery}%25,model.ilike.%25${encodedQuery}%25)&order=created_at.desc&limit=${limit}&offset=${offset}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase error response:', errorText);
      return createErrorResponse(`Database error: ${response.status}`, 500);
    }
    
    const data = await response.json();
    
    // Validate response data
    if (!Array.isArray(data)) {
      return createErrorResponse('Invalid response format', 500);
    }
    
    // Get total count for pagination
    const countUrl = `${SUPABASE_URL}/rest/v1/cars?select=count`;
    const countResponse = await fetch(countUrl, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    let totalCount = 0;
    if (countResponse.ok) {
      const countData = await countResponse.json();
      totalCount = countData[0]?.count || 0;
    }
    
    const responseData = { 
      data: data, 
      count: data.length,
      totalCount,
      page,
      limit,
      hasMore: offset + limit < totalCount
    };
    
    return new NextResponse(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'CDN-Cache-Control': 'public, max-age=60',
        ...getSecurityHeaders(),
        'X-RateLimit-Remaining': rateLimiter.getRemainingRequests(ip).toString(),
        'X-RateLimit-Reset': rateLimiter.getResetTime(ip).toString(),
      }
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error', 
      500
    );
  }
} 