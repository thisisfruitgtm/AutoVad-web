'use client';
import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

export function HlsPlayer({ src, poster, ...props }: { src: string; poster?: string; [key: string]: unknown }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = src;
      } else if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(videoRef.current);
        return () => {
          hls.destroy();
        };
      }
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      poster={poster}
      controls
      style={{ width: '100%', height: 'auto', background: 'black' }}
      {...props}
    />
  );
} 