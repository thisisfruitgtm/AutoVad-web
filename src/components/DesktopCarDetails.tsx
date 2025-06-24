'use client';

import { Car } from '@/types/car';
import Image from 'next/image';
import { Heart, Share, Gauge, Fuel, MapPin, User, Shield } from 'lucide-react';

interface DesktopCarDetailsProps {
  car: Car;
  onImageClick: (images: string[], index: number) => void;
  onLike: (carId: string) => void;
  onShare: (carId:string) => void;
}

export function DesktopCarDetails({ car, onImageClick, onLike, onShare }: DesktopCarDetailsProps) {
  // Use images directly from car data (like React Native app)
  const images = car.images || [];

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('ro-RO').format(mileage) + ' km';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
      {/* Header with Title and Main Specs */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">{car.make} {car.model}</h2>
          <div className="flex items-center gap-3">
            <button onClick={() => onLike(car.id)} className="p-2 rounded-full bg-gray-800/80 hover:bg-orange-500/10 text-white hover:text-orange-500 transition-all">
              <Heart className="w-5 h-5" />
            </button>
            <button onClick={() => onShare(car.id)} className="p-2 rounded-full bg-gray-800/80 hover:bg-orange-500/10 text-white hover:text-orange-500 transition-all">
              <Share className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Price and Year - Prominent Display */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 bg-gray-800/50 px-4 py-3 rounded-xl text-white">
            <div className="text-sm mb-1 text-orange-200">Preț</div>
            <div className="text-xl font-bold">{formatPrice(car.price)}</div>
          </div>
          <div className="flex-1 bg-gray-800/50 px-4 py-3 rounded-xl text-white">
            <div className="text-sm mb-1 text-gray-400">An fabricație</div>
            <div className="text-xl font-bold">{car.year}</div>
          </div>
        </div>

        {/* Key Specs Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Gauge className="w-4 h-4" />
              <span className="text-sm">Kilometraj</span>
            </div>
            <div className="text-white font-medium">{formatMileage(car.mileage)}</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Fuel className="w-4 h-4" />
              <span className="text-sm">Combustibil</span>
            </div>
            <div className="text-white font-medium">{car.fuel_type}</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Locație</span>
            </div>
            <div className="text-white font-medium">{car.location}</div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <span className="text-sm text-gray-700 uppercase tracking-wider">Descriere</span>
          <div className="h-px flex-1 bg-gray-800"></div>
        </h3>
        <p className="text-gray-300 leading-relaxed">{car.description}</p>
      </div>

      {/* Photos Grid */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <span className="text-sm text-gray-700 uppercase tracking-wider">Galerie Foto</span>
          <div className="h-px flex-1 bg-gray-800"></div>
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {images.length > 0 ? (
            images.map((image: string, index: number) => (
              <button 
                key={index}
                onClick={() => onImageClick(images, index)}
                className="relative group aspect-video bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-orange-500 transition-all"
              >
                <Image 
                  src={image} 
                  alt={`${car.make} ${car.model} - Poza ${index + 1}`}
                  className="w-full h-full object-contain transition-transform duration-300"
                  width={400}
                  height={225}
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))
          ) : (
            <div className="col-span-4 text-center py-8 text-gray-400">
              Nu există imagini disponibile
            </div>
          )}
        </div>
      </div>

      {/* Seller Section */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <span className="text-sm text-gray-700 uppercase tracking-wider">Vânzător</span>
          <div className="h-px flex-1 bg-gray-800"></div>
        </h3>
        <div className="flex items-center  rounded-xl gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center ring-2 ring-orange-500/20">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white font-medium">Autovad Demo</span>
              <div className="bg-orange-500/10 p-1 rounded-full">
                <Shield className="w-4 h-4 text-orange-500" />
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-orange-500">⭐ 5.0</div>
              <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
              <div className="text-gray-400">Membru din 2023</div>
            </div>
          </div>
          <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors">
            Contactează
          </button>
        </div>
      </div>
    </div>
  );
} 