import { Car } from '@/types/car';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share, MapPin, Fuel, Gauge, User, Shield } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { ImageViewer } from './ImageViewer';
import Image from 'next/image';
import { trackCarView, trackLike, trackComment, trackShare } from '@/lib/analytics';
import { CustomVideoPlayer } from './CustomVideoPlayer';
import { getMuxThumbnailUrl } from '@/lib/utils';

interface CarPostProps {
  car: Car;
  onLike?: (carId: string) => void;
  onComment?: (carId: string) => void;
  onShare?: (carId: string) => void;
  displayMode?: 'full' | 'compact';
}

export function CarPost({ car, onLike, onComment, onShare, displayMode = 'full' }: CarPostProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [isVideoHovered, setIsVideoHovered] = useState(false);
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use media directly from car data (like React Native app)
  const images = car.images || [];
  const videos = car.videos || [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);
          
          // Track car view when it comes into view for the first time
          if (entry.isIntersecting && !hasTrackedView) {
            trackCarView({
              carId: car.id,
              carTitle: `${car.make} ${car.model}`,
              carBrand: car.make,
              carModel: car.model,
              carYear: car.year,
              carPrice: car.price,
              source: 'browse',
            });
            setHasTrackedView(true);
          }
        });
      },
      {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    const ref = containerRef.current;
    if (ref) {
      observer.observe(ref);
    }

    return () => {
      if (ref) {
        observer.unobserve(ref);
      }
    };
  }, [car.id, car.make, car.model, car.year, car.price, hasTrackedView]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('ro-RO').format(mileage) + ' km';
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    
    // Track like/unlike action
    trackLike({
      carId: car.id,
      carTitle: `${car.make} ${car.model}`,
      action: isLiked ? 'unlike' : 'like',
    });
    
    onLike?.(car.id);
  };

  const handleComment = () => {
    // Track comment action
    trackComment({
      carId: car.id,
      carTitle: `${car.make} ${car.model}`,
      action: 'add',
    });
    
    onComment?.(car.id);
  };

  const handleShare = () => {
    // Track share action
    trackShare({
      carId: car.id,
      carTitle: `${car.make} ${car.model}`,
      platform: 'copy_link',
    });
    
    onShare?.(car.id);
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setShowImageViewer(true);
  };

  const handleVideoMouseEnter = () => {
    setIsVideoHovered(true);
  };

  const handleVideoMouseLeave = () => {
    setIsVideoHovered(false);
  };

  // Handle demo cars without seller
  const seller = {
    id: 'demo',
    name: 'Autovad Demo',
    avatar_url: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    rating: 5.0,
    verified: true,
  };

  // Helper for thumbnail
  const getThumbnail = (url: string | undefined) => url ? `${url}?width=200&quality=60` : null;

  // Helper for video poster - use Mux thumbnail URL
  const getVideoPoster = (url: string | undefined) => {
    if (!url) return undefined;
    // Extract playback ID from Mux URL and generate thumbnail
    const playbackId = url.replace('https://stream.mux.com/', '').replace('.m3u8', '');
    return getMuxThumbnailUrl(playbackId);
  };

  return (
    <>
      <Card 
        className="overflow-hidden bg-black border-gray-800 hover:border-orange-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)]"
      >
        <CardContent className="p-0">
          {/* Video/Image Section */}
          <div ref={containerRef} className="relative aspect-[9/16] bg-gray-900">
            {videos.length > 0 ? (
              <div 
                className="relative w-full h-full group"
                onMouseEnter={handleVideoMouseEnter}
                onMouseLeave={handleVideoMouseLeave}
              >
                <CustomVideoPlayer
                  ref={videoRef}
                  src={videos[0]}
                  poster={getVideoPoster(videos[0])}
                  isHovered={isVideoHovered}
                  isInView={isInView}
                />
              </div>
            ) : (
              <button
                onClick={() => handleImageClick(0)}
                className="w-full h-full"
              >
                <Image
                  src={displayMode === 'compact' ? (getThumbnail(images[0]) || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800') : (images[0] || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800')}
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-full object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, 360px"
                  priority={false}
                />
              </button>
            )}
            

            {displayMode === 'full' && (
              /* Bottom Overlay - Car Info */
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-24 pb-6 px-4 sm:px-6">
                <div className="flex justify-between items-end gap-4 sm:gap-6">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-3 sm:mb-4 truncate">
                      {car.make} {car.model}
                    </h3>
                    
                    {/* Specs */}
                    <div className="flex flex-wrap gap-4 sm:gap-6 mb-4 sm:mb-6">
                      <div className="flex items-center gap-2 sm:gap-2.5 text-gray-200">
                        <Badge className="bg-orange-500/90 text-white px-2 py-1">
                          {formatPrice(car.price)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-2.5 text-gray-200">
                        <Badge className="bg-black/80 text-white px-2 py-1">
                          {car.year}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-2.5 text-gray-200">
                        <Gauge size={16} className="text-orange-500 sm:w-[18px] sm:h-[18px]" />
                        <span className="text-xs sm:text-sm font-medium">{formatMileage(car.mileage)}</span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-2.5 text-gray-200">
                        <Fuel size={16} className="text-orange-500 sm:w-[18px] sm:h-[18px]" />
                        <span className="text-xs sm:text-sm font-medium">{car.fuel_type}</span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-2.5 text-gray-200">
                        <MapPin size={16} className="text-orange-500 sm:w-[18px] sm:h-[18px]" />
                        <span className="text-xs sm:text-sm font-medium">{car.location}</span>
                      </div>
                    </div>

                    {/* Seller Info */}
                    <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-800 rounded-full flex items-center justify-center ring-2 ring-orange-500/20">
                        <User size={20} className="text-gray-400 sm:w-6 sm:h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm sm:text-base text-white font-medium truncate">{seller.name}</span>
                          {seller.verified && (
                            <div className="bg-orange-500/10 p-1 rounded-full">
                              <Shield size={12} className="text-orange-500" />
                            </div>
                          )}
                        </div>
                        <span className="text-xs sm:text-sm text-gray-400">⭐ {seller.rating}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <p className="text-xs sm:text-sm text-gray-300 leading-relaxed line-clamp-2">
                        {showFullDescription ? car.description : car.description}
                      </p>
                      {car.description.length > 100 && (
                        <button
                          onClick={() => setShowFullDescription(!showFullDescription)}
                          className="text-orange-500 text-xs sm:text-sm mt-2 sm:mt-3 hover:text-orange-400 transition-colors font-medium"
                        >
                          {showFullDescription ? 'Arată mai puțin' : 'Arată mai mult'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-4 sm:gap-6 ml-2 sm:ml-4">
                    <button
                      onClick={handleLike}
                      className="flex flex-col items-center gap-1.5 sm:gap-2 text-white hover:text-orange-500 transition-all duration-300 group"
                    >
                      <div className="p-1.5 sm:p-2 rounded-full bg-gray-800/80 backdrop-blur-sm group-hover:bg-orange-500/10 transition-all duration-300">
                        <Heart 
                          size={24} 
                          className={isLiked ? 'text-orange-500 fill-orange-500 sm:w-7 sm:h-7' : 'sm:w-7 sm:h-7'}
                        />
                      </div>
                      <span className="text-[10px] sm:text-xs font-medium">{car.likes_count || 0}</span>
                    </button>

                    <button
                      onClick={handleComment}
                      className="flex flex-col items-center gap-1.5 sm:gap-2 text-white hover:text-orange-500 transition-all duration-300 group"
                    >
                      <div className="p-1.5 sm:p-2 rounded-full bg-gray-800/80 backdrop-blur-sm group-hover:bg-orange-500/10 transition-all duration-300">
                        <MessageCircle size={24} className="sm:w-7 sm:h-7" />
                      </div>
                      <span className="text-[10px] sm:text-xs font-medium">{car.comments_count || 0}</span>
                    </button>

                    <button
                      onClick={handleShare}
                      className="flex flex-col items-center gap-1.5 sm:gap-2 text-white hover:text-orange-500 transition-all duration-300 group"
                    >
                      <div className="p-1.5 sm:p-2 rounded-full bg-gray-800/80 backdrop-blur-sm group-hover:bg-orange-500/10 transition-all duration-300">
                        <Share size={24} className="sm:w-7 sm:h-7" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Galerie Foto */}
          {displayMode === 'full' && images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {images.map((image, idx) => (
                <button
                  key={idx}
                  onClick={() => handleImageClick(idx)}
                  className="relative w-20 h-14 rounded-lg overflow-hidden border-2 border-transparent hover:border-orange-500 transition-all bg-gray-900"
                >
                  <Image
                    src={image}
                    alt={`Poza ${idx + 1}`}
                    fill
                    className="object-contain"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ImageViewer
        images={images}
        initialIndex={selectedImageIndex}
        isOpen={showImageViewer}
        onClose={() => setShowImageViewer(false)}
      />
    </>
  );
} 