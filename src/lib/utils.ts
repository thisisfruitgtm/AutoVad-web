import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert Mux playback ID to proper video URL
 */
export function getMuxVideoUrl(playbackId: string): string {
  if (!playbackId) return '';
  
  // Check if it's already a full URL
  if (playbackId.startsWith('http')) {
    return playbackId;
  }
  
  // Check if it looks like a valid Mux playback ID (alphanumeric, ~40 chars)
  // Mux playback IDs are typically 40-50 characters long
  if (playbackId.length >= 30 && playbackId.length <= 60 && /^[a-zA-Z0-9]+$/.test(playbackId)) {
    return `https://stream.mux.com/${playbackId}.m3u8`;
  }
  
  // If it doesn't look like a valid Mux ID, return empty to prevent 404s
  console.warn('Invalid Mux playback ID format:', playbackId);
  return '';
}

/**
 * Generate Mux thumbnail URL from playback ID
 */
export function getMuxThumbnailUrl(playbackId: string): string {
  if (!playbackId) return '';
  
  // If it's a Mux playback ID, generate thumbnail URL
  if (playbackId.length >= 30 && playbackId.length <= 60 && /^[a-zA-Z0-9]+$/.test(playbackId) && !playbackId.startsWith('http')) {
    return `https://image.mux.com/${playbackId}/thumbnail.jpg`;
  }
  
  // If it doesn't look like a valid Mux ID, return empty to prevent 404s
  console.warn('Invalid Mux playback ID format for thumbnail:', playbackId);
  return '';
}
