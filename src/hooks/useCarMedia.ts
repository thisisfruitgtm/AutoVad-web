import { useState, useEffect, useRef } from 'react';
import { carService } from '@/services/carService';

export function useCarMedia(carId: string, isInView: boolean) {
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const loadingRef = useRef(false);

  useEffect(() => {
    // Only fetch if we have a carId and the component is in view.
    if (!isInView || !carId || loaded) {
      return;
    }

    const controller = new AbortController();

    const fetchMedia = async () => {
      if (loadingRef.current) return;
      
      loadingRef.current = true;
      setLoading(true);

      try {
        const media = await carService.getCarMedia(carId, controller.signal);
        if (!controller.signal.aborted) {
          setImages(media.images);
          setVideos(media.videos);
          setLoaded(true);
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error loading car media:', error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          loadingRef.current = false;
        }
      }
    };

    fetchMedia();

    return () => {
      controller.abort();
      loadingRef.current = false; // Reset loading ref on cleanup
    };
  }, [carId, isInView, loaded]);

  return { images, videos, loading, loaded };
} 