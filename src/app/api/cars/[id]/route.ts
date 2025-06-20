import { NextRequest, NextResponse } from 'next/server';

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
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const url = request.nextUrl;
    const id = url.pathname.split('/').pop();
    const includeImages = url.searchParams.get('images') === 'true';
    
    // Validation: ID must exist and be numeric
    if (!id || !/^\d+$/.test(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid car id - must be numeric' },
        { status: 400 }
      );
    }

    // Select fields based on whether images are needed
    const selectFields = includeImages 
      ? 'id,make,model,year,price,mileage,color,fuel_type,transmission,body_type,description,location,status,created_at,likes_count,comments_count,images,videos'
      : 'id,make,model,year,price,mileage,color,fuel_type,transmission,body_type,description,location,status,created_at,likes_count,comments_count';

    const response = await fetch(`${SUPABASE_URL}/rest/v1/cars?id=eq.${id}&select=${selectFields}`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Supabase error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Car not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: data[0]
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // Cache for 5 minutes
        'CDN-Cache-Control': 'public, max-age=300',
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 