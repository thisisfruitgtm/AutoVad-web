'use client';

import React, { useState, useEffect } from 'react';
import { Car } from '@/types/car';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Eye, MapPin, Share, Fuel, Gauge, Building, User, Shield } from 'lucide-react';
import Image from 'next/image';
import { trackCarView, trackLike } from '@/lib/analytics';
import { getMuxVideoUrl, getMuxThumbnailUrl } from '@/lib/utils';
import { HlsPlayer } from './HlsPlayer';
import { ImageViewer } from './ImageViewer';

interface CarCardProps {
  car: Car;
  onLike?: (carId: string) => void;
  onComment?: (carId: string) => void;
  onShare?: (carId: string) => void;
  onView?: (carId: string) => void;
  isVisible?: boolean;
  autoPlay?: boolean;
}

export function CarCard({ 
  car, 
  onLike, 
  onComment, 
  onShare, 
  onView, 
  isVisible = true, 
  autoPlay = true 
}: CarCardProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Transform videos to proper Mux URLs and images
  const optimizedVideos = car.videos?.map(video => ({
    url: getMuxVideoUrl(video),
    poster: getMuxThumbnailUrl(video)
  })).filter(video => video.url) || [];

  const optimizedImages = car.images || [];
  const allMedia = [...optimizedVideos.map(v => v.url), ...optimizedImages];
  
  const isCurrentVideo = currentMediaIndex < optimizedVideos.length;
  const currentMediaUrl = allMedia[currentMediaIndex];
  const currentVideoPoster = isCurrentVideo && optimizedVideos[currentMediaIndex] ? 
    (car.thumbnail_url || optimizedVideos[currentMediaIndex].poster) : null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('ro-RO').format(mileage);
  };

  const handleCardClick = () => {
    // Track car view when card is clicked
    trackCarView({
      carId: car.id,
      carTitle: `${car.make} ${car.model}`,
      carBrand: car.make,
      carModel: car.model,
      carYear: car.year,
      carPrice: car.price,
      source: 'browse',
    });
  };

  const handleLike = () => {
    if (onLike) {
      onLike(car.id);
    }
  };

  const handleComment = () => {
    if (onComment) {
      onComment(car.id);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(car.id);
    }
  };

  const handleView = () => {
    if (onView) {
      onView(car.id);
    }
  };

  const goToNext = () => {
    const newIndex = currentMediaIndex < allMedia.length - 1 ? currentMediaIndex + 1 : 0;
    setCurrentMediaIndex(newIndex);
    setIsPlaying(false);
  };

  const goToPrevious = () => {
    const newIndex = currentMediaIndex > 0 ? currentMediaIndex - 1 : allMedia.length - 1;
    setCurrentMediaIndex(newIndex);
    setIsPlaying(false);
  };

  const handleDotPress = (index: number) => {
    setCurrentMediaIndex(index);
    setIsPlaying(false);
  };

  // Handle visibility changes
  useEffect(() => {
    if (!isVisible) {
      setIsPlaying(false);
    } else if (autoPlay && isCurrentVideo) {
      setIsPlaying(true);
    }
  }, [isVisible, autoPlay, isCurrentVideo]);

  // Handle demo cars without seller
  const seller = car.seller || {
    id: 'demo',
    name: 'Autovad Demo',
    avatar_url: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    rating: 5.0,
    verified: true,
  };

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden bg-black text-white border-0">
      <CardContent className="p-0 relative">
        {/* Media Section */}
        <div className="relative w-full h-96 bg-black">
          {isCurrentVideo && currentMediaUrl ? (
            <HlsPlayer
              src={currentMediaUrl}
              poster={currentVideoPoster || undefined}
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <div className="w-full h-full relative">
              {optimizedImages.length > 0 && (
                <Image
                  src={optimizedImages[currentMediaIndex - optimizedVideos.length] || optimizedImages[0]}
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-full object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              )}
            </div>
          )}

          {/* Navigation Controls */}
          {allMedia.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
              >
                ‹
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNext}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
              >
                ›
              </Button>

              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {allMedia.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotPress(index)}
                    className={`w-2 h-2 rounded-full ${
                      index === currentMediaIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top Info */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-white">
                {formatPrice(car.price)}
              </span>
              <Badge variant="secondary" className="bg-white/20 text-white">
                {car.year}
              </Badge>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4">
            <div className="flex justify-between items-end">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  {car.make} {car.model}
                </h3>
                
                <div className="flex items-center space-x-4 mb-3 text-sm text-white/80">
                  <div className="flex items-center space-x-1">
                    <Gauge size={16} className="text-orange-500" />
                    <span>{formatMileage(car.mileage)} km</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Fuel size={16} className="text-orange-500" />
                    <span>{car.fuel_type}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin size={16} className="text-orange-500" />
                    <span>{car.location}</span>
                  </div>
                </div>

                {/* Seller Info */}
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    {car.seller_type === 'brand' ? (
                      <Building size={16} className="text-white" />
                    ) : (
                      <User size={16} className="text-white" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1">
                      <span className="text-white font-medium">
                        {car.seller_type === 'brand' && car.brand ? car.brand.name : seller.name}
                      </span>
                      {((car.seller_type === 'brand' && car.brand?.verified) || 
                        (car.seller_type === 'individual' && seller.verified)) && (
                        <Shield size={12} className="text-orange-500" />
                      )}
                    </div>
                    <span className="text-white/70 text-sm">
                      ⭐ {car.seller_type === 'brand' && car.brand ? car.brand.rating : seller.rating}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-3">
                  <p className={`text-white/90 text-sm ${!showFullDescription && car.description.length > 100 ? 'line-clamp-2' : ''}`}>
                    {car.description}
                  </p>
                  {car.description.length > 100 && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="text-orange-500 text-sm mt-1 pointer-events-auto"
                    >
                      {showFullDescription ? 'Arată mai puțin' : 'Arată mai mult'}
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-3 ml-4 pointer-events-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className="bg-black/50 hover:bg-black/70 text-white p-2"
                >
                  <Heart 
                    size={24} 
                    className={car.is_liked ? 'text-orange-500 fill-orange-500' : 'text-white'} 
                  />
                  <span className="ml-1 text-sm">{car.likes_count || 0}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleComment}
                  className="bg-black/50 hover:bg-black/70 text-white p-2"
                >
                  <MessageCircle size={24} className="text-white" />
                  <span className="ml-1 text-sm">{car.comments_count || 0}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="bg-black/50 hover:bg-black/70 text-white p-2"
                >
                  <Share size={24} className="text-white" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 