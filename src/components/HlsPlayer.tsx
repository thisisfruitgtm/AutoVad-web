'use client';
import { useEffect, useRef, forwardRef } from 'react';
import Hls from 'hls.js';

interface HlsPlayerProps {
  src: string;
  poster?: string;
  style?: React.CSSProperties;
}

export const HlsPlayer = forwardRef<HTMLVideoElement, HlsPlayerProps>(({ src, poster, style }, ref) => {
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef = (ref || internalVideoRef) as React.RefObject<HTMLVideoElement>;

  useEffect(() => {
    if (videoRef.current) {
      // Check if it's an HLS stream
      if (src.includes('.m3u8') || src.includes('application/vnd.apple.mpegurl')) {
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
      } else {
        // Regular MP4 or other video formats
        videoRef.current.src = src;
      }
    }
  }, [src, videoRef]);

  return (
    <video
      ref={videoRef}
      poster={poster}
      style={{ 
        width: '100%', 
        height: '100%', 
        objectFit: 'cover',
        aspectRatio: '9/16',
        background: 'black',
        ...style
      }}
    />
  );
});

HlsPlayer.displayName = "HlsPlayer"; 