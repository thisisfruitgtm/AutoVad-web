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
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20'); // Reduced from unlimited to 20
    
    // Basic validation: query max 50 chars, no special chars
    if (query && (!/^[\w\s-]{0,50}$/.test(query))) {
      return NextResponse.json({ success: false, error: 'Invalid query' }, { status: 400 });
    }
    
    // Validate pagination
    if (page < 1 || limit < 1 || limit > 50) {
      return NextResponse.json({ success: false, error: 'Invalid pagination parameters' }, { status: 400 });
    }
    
    const offset = (page - 1) * limit;
    
    // Optimize query to select only necessary fields and limit results
    let url = `${SUPABASE_URL}/rest/v1/cars?select=id,make,model,year,price,mileage,color,fuel_type,transmission,body_type,description,location,status,created_at,likes_count,comments_count,images,videos&order=created_at.desc&limit=${limit}&offset=${offset}`;
    
    if (query) {
      url = `${SUPABASE_URL}/rest/v1/cars?select=id,make,model,year,price,mileage,color,fuel_type,transmission,body_type,description,location,status,created_at,likes_count,comments_count,images,videos&or=(make.ilike.%25${query}%25,model.ilike.%25${query}%25)&order=created_at.desc&limit=${limit}&offset=${offset}`;
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
      throw new Error(`Supabase error: ${response.status}`);
    }
    const data = await response.json();
    
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
    
    return NextResponse.json({ 
      success: true, 
      data: data, 
      count: data.length,
      totalCount,
      page,
      limit,
      hasMore: offset + limit < totalCount
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300', // Cache for 1 minute, stale for 5 minutes
        'CDN-Cache-Control': 'public, max-age=60',
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