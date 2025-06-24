import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { uploadId } = await request.json();
    
    if (!uploadId) {
      return NextResponse.json({ error: 'uploadId is required' }, { status: 400 });
    }

    // Check if we have a car with this uploadId in asset_ids
    const { data: cars, error } = await supabase
      .from('cars')
      .select('id, videos, playback_id')
      .contains('asset_ids', [uploadId])
      .limit(1);

    if (error) {
      console.error('❌ Supabase select error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (cars && cars.length > 0) {
      const car = cars[0];
      // Check if videos array contains a real Mux playbackId (not starting with 'mock-')
      const realVideo = car.videos?.find((videoId: string) => 
        videoId && !videoId.startsWith('mock-') && videoId.length > 10
      );
      
      if (realVideo) {
        return NextResponse.json({ 
          playbackId: realVideo, 
          assetId: uploadId 
        });
      }
    }

    // No real video found yet
    return NextResponse.json({ 
      processing: true 
    });

  } catch (error) {
    console.error('❌ Mux webhook check error:', error);
    return NextResponse.json(
      { error: (error as Error).message }, 
      { status: 500 }
    );
  }
} 