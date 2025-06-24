import { NextRequest, NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('🔄 Mux upload API called');
    
    // Verifică dacă variabilele de mediu sunt configurate
    if (!process.env.MUX_ACCESS_TOKEN_ID || !process.env.MUX_SECRET_KEY) {
      console.error('❌ Mux environment variables not configured');
      return NextResponse.json(
        { error: 'Mux configuration missing - please check environment variables' }, 
        { status: 500 }
      );
    }
    
    // Import Mux doar dacă variabilele sunt configurate
    const { default: Mux } = await import('@mux/mux-node');
    
    const mux = new Mux({
      tokenId: process.env.MUX_ACCESS_TOKEN_ID,
      tokenSecret: process.env.MUX_SECRET_KEY,
    });
    
    const upload = await mux.video.uploads.create({
      new_asset_settings: { playback_policy: ['public'] },
      cors_origin: '*',
    });
    
    console.log('✅ Mux upload created:', upload.id);
    
    return NextResponse.json({ 
      url: upload.url, 
      uploadId: upload.id 
    });
  } catch (error) {
    console.error('❌ Mux upload API error:', error);
    return NextResponse.json(
      { error: (error as Error).message }, 
      { status: 500 }
    );
  }
} 