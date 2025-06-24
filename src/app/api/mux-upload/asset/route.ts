import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { uploadId } = await request.json();
    
    if (!uploadId) {
      return NextResponse.json({ error: 'uploadId is required' }, { status: 400 });
    }

    if (!process.env.MUX_ACCESS_TOKEN_ID || !process.env.MUX_SECRET_KEY) {
      console.error('❌ Mux environment variables not configured');
      return NextResponse.json(
        { error: 'Mux configuration missing' }, 
        { status: 500 }
      );
    }

    // Import Mux
    const { default: Mux } = await import('@mux/mux-node');
    
    const mux = new Mux({
      tokenId: process.env.MUX_ACCESS_TOKEN_ID,
      tokenSecret: process.env.MUX_SECRET_KEY,
    });

    // Get the upload to find the asset ID
    const upload = await mux.video.uploads.retrieve(uploadId);
    console.log('📊 Upload status:', upload.status, 'Asset ID:', upload.asset_id);
    
    if (upload.asset_id) {
      return NextResponse.json({ 
        assetId: upload.asset_id,
        uploadStatus: upload.status
      });
    } else {
      return NextResponse.json({ 
        processing: true,
        uploadStatus: upload.status
      });
    }

  } catch (error) {
    console.error('❌ Mux upload asset error:', error);
    return NextResponse.json(
      { error: (error as Error).message }, 
      { status: 500 }
    );
  }
} 