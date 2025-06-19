import { Car } from '@/types/car';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Eye, MapPin } from 'lucide-react';
import Image from 'next/image';

interface CarCardProps {
  car: Car;
}

export function CarCard({ car }: CarCardProps) {
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

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="relative">
          <Image
            src={car.images[0] || '/placeholder-car.jpg'}
            alt={`${car.make} ${car.model}`}
            className="w-full h-48 object-cover"
            width={400}
            height={192}
          />
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-black/70 text-white">
              {formatPrice(car.price)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">
            {car.make} {car.model}
          </h3>
          <p className="text-sm text-gray-600">{car.year}</p>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            {car.location}
          </div>

          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">
              {car.fuel_type}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {car.transmission}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {car.body_type}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {formatMileage(car.mileage)}
            </Badge>
          </div>

          <p className="text-sm text-gray-700 line-clamp-2">
            {car.description}
          </p>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {car.likes_count}
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {car.comments_count}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {car.views_count}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 