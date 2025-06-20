import { useState, useEffect, useRef } from 'react';
import { carService } from '@/services/carService';

export function useCarMedia(carId: string, isInView: boolean) {
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const loadingRef = useRef(false);

  useEffect(() => {
    if (isInView && !loaded && !loadingRef.current) {
      loadingRef.current = true;
      setLoading(true);
      
      carService.getCarMedia(carId)
        .then((media) => {
          setImages(media.images);
          setVideos(media.videos);
          setLoaded(true);
        })
        .catch((error) => {
          console.error('Error loading car media:', error);
        })
        .finally(() => {
          setLoading(false);
          loadingRef.current = false;
        });
    }
  }, [carId, isInView, loaded]);

  return { images, videos, loading, loaded };
} 