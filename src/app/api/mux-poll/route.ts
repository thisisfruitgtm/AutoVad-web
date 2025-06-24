import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { assetId } = await request.json();
    
    if (!assetId) {
      return NextResponse.json({ error: 'assetId is required' }, { status: 400 });
    }

    if (!process.env.MUX_ACCESS_TOKEN_ID || !process.env.MUX_SECRET_KEY) {
      console.error('❌ Mux environment variables not configured');
      return NextResponse.json(
        { error: 'Mux configuration missing' }, 
        { status: 500 }
      );
    }

    // Poll Mux directly for asset status
    const muxApiUrl = `https://api.mux.com/video/v1/assets/${assetId}`;
    const muxRes = await fetch(muxApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.MUX_ACCESS_TOKEN_ID}:${process.env.MUX_SECRET_KEY}`).toString('base64')}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!muxRes.ok) {
      console.error('❌ Mux API error:', muxRes.status, muxRes.statusText);
      return NextResponse.json(
        { error: `Mux API error: ${muxRes.status}` }, 
        { status: muxRes.status }
      );
    }

    const assetData = await muxRes.json();
    console.log('📊 Mux asset status for', assetId, ':', assetData.data?.status);
    
    if (assetData.data?.status === 'ready' && assetData.data?.playback_ids?.length > 0) {
      const playbackId = assetData.data.playback_ids[0].id;
      console.log('✅ Asset ready with playback ID:', playbackId);
      return NextResponse.json({ 
        status: 'ready',
        playbackId,
        assetId: assetData.data.id
      });
    } else {
      return NextResponse.json({ 
        status: assetData.data?.status || 'unknown',
        processing: true
      });
    }

  } catch (error) {
    console.error('❌ Mux poll error:', error);
    return NextResponse.json(
      { error: (error as Error).message }, 
      { status: 500 }
    );
  }
} 