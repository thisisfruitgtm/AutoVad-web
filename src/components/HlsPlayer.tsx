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
    if (videoRef.current && src) {
      // Check if it's an HLS stream
      if (src.includes('.m3u8') || src.includes('application/vnd.apple.mpegurl')) {
        if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          videoRef.current.src = src;
        } else if (Hls.isSupported()) {
          const hls = new Hls({
            xhrSetup: (xhr) => {
              // Don't send credentials for external media requests
              xhr.withCredentials = false;
            }
          });
          
          // Handle HLS errors
          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.warn('HLS network error, trying to recover...', data);
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.warn('HLS media error, trying to recover...', data);
                  hls.recoverMediaError();
                  break;
                default:
                  console.error('HLS fatal error, cannot recover:', data);
                  hls.destroy();
                  break;
              }
            } else {
              console.debug('HLS non-fatal error:', data);
            }
          });
          
          hls.loadSource(src);
          hls.attachMedia(videoRef.current);
          
          return () => {
            if (hls) {
              hls.destroy();
            }
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
      crossOrigin="anonymous"
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