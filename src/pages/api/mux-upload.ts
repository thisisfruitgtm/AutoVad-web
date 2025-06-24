import type { NextApiRequest, NextApiResponse } from 'next';
import Mux from '@mux/mux-node';

const mux = new Mux({
  tokenId: process.env.MUX_ACCESS_TOKEN_ID!,
  tokenSecret: process.env.MUX_SECRET_KEY!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const upload = await mux.video.uploads.create({
        new_asset_settings: { playback_policy: ['public'] },
        cors_origin: '*',
      });
      res.status(200).json({ url: upload.url, uploadId: upload.id });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  } else {
    res.status(405).end();
  }
} 