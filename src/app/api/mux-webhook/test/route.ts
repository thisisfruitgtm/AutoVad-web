import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Mux webhook endpoint is accessible',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({ 
      status: 'ok', 
      message: 'Test webhook received',
      data: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: 'Invalid JSON',
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }
} 