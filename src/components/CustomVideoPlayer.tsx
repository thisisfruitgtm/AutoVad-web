/* eslint-disable @typescript-eslint/no-unused-expressions */
'use client';

import { useState, useRef, useEffect, forwardRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { HlsPlayer } from './HlsPlayer';

interface CustomVideoPlayerProps {
  src: string;
  poster?: string;
  isHovered: boolean;
  isInView: boolean;
}

export const CustomVideoPlayer = forwardRef<HTMLVideoElement, CustomVideoPlayerProps>(({ src, poster, isHovered, isInView }, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const internalVideoRef = useRef<HTMLVideoElement | null>(null);

  const videoRef = (ref || internalVideoRef) as React.RefObject<HTMLVideoElement>;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Safari can be aggressive with autoplaying muted videos.
    // This ensures it's paused as soon as metadata is loaded, respecting our hover logic.
    const handleDataLoaded = () => {
      if (video && !isHovered) {
        video.pause();
      }
    };
    
    video.addEventListener('loadedmetadata', handleDataLoaded);

    const handleTimeUpdate = () => setProgress(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    
    setDuration(video.duration);
    setIsMuted(video.muted);

    return () => {
      video.removeEventListener('loadedmetadata', handleDataLoaded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [videoRef, isHovered]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isInView && isHovered) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      void video.play();
    } else {
      video.pause();
    }
  }, [isInView, isHovered, videoRef]);
  
  useEffect(() => {
    const video = videoRef.current;
    if (video && isInView) {
      video.preload = 'auto';
    }
  }, [isInView, videoRef]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    isPlaying ? video.pause() : video.play();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Number(e.target.value);
  };

  const toggleFullScreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => {
        alert(`Error: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };
  
  useEffect(() => {
    const handleFullScreenChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div ref={containerRef} className="relative w-full h-full group/player overflow-hidden bg-black">
      {/* Check if it's an HLS stream or regular video */}
      {src.includes('.m3u8') || src.includes('application/vnd.apple.mpegurl') ? (
        <HlsPlayer 
          ref={videoRef}
          src={src} 
          poster={poster} 
          style={{ width: '100%', height: '100%', background: 'black' }} 
        />
      ) : (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            aspectRatio: '9/16',
            background: 'black' 
          }}
        />
      )}
      
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 md:p-4 opacity-0 group-hover/player:opacity-100 transition-opacity duration-300">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={progress}
          onChange={handleProgressChange}
          className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />
        
        <div className="flex items-center justify-between mt-1 text-white">
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={togglePlayPause}>
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button onClick={toggleMute}>
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <div className="text-xs font-mono">
              {formatTime(progress)} / {formatTime(duration)}
            </div>
          </div>
          <button onClick={toggleFullScreen}>
            {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
});

CustomVideoPlayer.displayName = "CustomVideoPlayer"; 