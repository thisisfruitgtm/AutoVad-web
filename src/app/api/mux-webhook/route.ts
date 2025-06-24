import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const event = await request.json();
    console.log('🔄 Mux webhook received:', event.type);
    
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
        const { error: updateError } = await supabase
          .from('cars')
          .update({ playback_id: playbackId, thumbnail_url: thumbnailUrl })
          .eq('id', carId);
          
        if (updateError) {
          console.error('❌ Supabase update error:', updateError);
        } else {
          console.log('✅ Updated car with playback_id and thumbnail_url:', carId);
        }
      } else {
        console.warn('⚠️ No car found for assetId:', assetId);
      }
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