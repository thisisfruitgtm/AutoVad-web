import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const event = req.body;
      if (event.type === 'video.asset.ready') {
        const playbackId = event.data.playback_ids?.[0]?.id;
        const assetId = event.data.id;
        const thumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`;
        // TODO: Salvează playbackId și thumbnailUrl în DB pentru assetId
        console.log('MUX ASSET READY:', { assetId, playbackId, thumbnailUrl });

        // Update cars table in Supabase
        // Caută mașina cu asset_ids care conține assetId
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
        // Caută mașina cu asset_ids ce conține assetId
        const { data: cars, error } = await supabase
          .from('cars')
          .select('id, asset_ids')
          .contains('asset_ids', [assetId]);
        if (error) {
          console.error('Supabase select error:', error);
        } else if (cars && cars.length > 0) {
          const carId = cars[0].id;
          const { error: updateError } = await supabase
            .from('cars')
            .update({ playback_id: playbackId, thumbnail_url: thumbnailUrl })
            .eq('id', carId);
          if (updateError) {
            console.error('Supabase update error:', updateError);
          } else {
            console.log('Updated car with playback_id and thumbnail_url:', carId);
          }
        } else {
          console.warn('No car found for assetId:', assetId);
        }
      }
      res.status(200).json({ received: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  } else {
    res.status(405).end();
  }
} 