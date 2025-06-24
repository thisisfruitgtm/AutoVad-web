import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const event = await request.json();
    console.log('🔄 Mux webhook received:', JSON.stringify(event, null, 2));
    
    // Handle all Mux events for debugging
    if (event.type === 'video.asset.ready') {
      const playbackId = event.data.playback_ids?.[0]?.id;
      const assetId = event.data.id;
      const thumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`;
      
      console.log('✅ MUX ASSET READY:', { assetId, playbackId, thumbnailUrl });

      // Update cars table in Supabase
      const { data: cars, error } = await supabase
        .from('cars')
        .select('id, asset_ids')
        .contains('asset_ids', [assetId]);
        
      if (error) {
        console.error('❌ Supabase select error:', error);
      } else if (cars && cars.length > 0) {
        const carId = cars[0].id;
        console.log('✅ Found car for assetId:', assetId, 'carId:', carId);
        
        // Fetch current videos array
        const { data: carData, error: fetchError } = await supabase
          .from('cars')
          .select('videos')
          .eq('id', carId)
          .single();
        let videos = carData?.videos || [];
        if (!videos.includes(playbackId)) {
          videos = [...videos, playbackId];
        }
        const { error: updateError } = await supabase
          .from('cars')
          .update({ playback_id: playbackId, thumbnail_url: thumbnailUrl, videos })
          .eq('id', carId);
        if (updateError) {
          console.error('❌ Supabase update error:', updateError);
        } else {
          console.log('✅ Updated car with playback_id, thumbnail_url, and videos:', carId);
        }
      } else {
        console.warn('⚠️ No car found for assetId:', assetId);
        console.log('🔍 Available cars with asset_ids:', await supabase.from('cars').select('id, asset_ids'));
      }
    } else {
      console.log('📝 Other Mux event:', event.type, event.data?.id);
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Mux webhook error:', error);
    return NextResponse.json(
      { error: (error as Error).message }, 
      { status: 500 }
    );
  }
} 