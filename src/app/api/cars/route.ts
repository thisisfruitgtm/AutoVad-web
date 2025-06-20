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
    // Basic validation: query max 50 chars, no special chars
    if (query && (!/^[\w\s-]{0,50}$/.test(query))) {
      return NextResponse.json({ success: false, error: 'Invalid query' }, { status: 400 });
    }
    let url = `${SUPABASE_URL}/rest/v1/cars?select=*&order=created_at.desc`;
    if (query) {
      url = `${SUPABASE_URL}/rest/v1/cars?select=*&or=(make.ilike.%25${query}%25,model.ilike.%25${query}%25)&order=created_at.desc`;
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
    return NextResponse.json({ success: true, data: data, count: data.length });
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