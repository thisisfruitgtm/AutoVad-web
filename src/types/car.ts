export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  color: string;
  fuel_type: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
  transmission: 'Manual' | 'Automatic';
  body_type: 'Sedan' | 'SUV' | 'Hatchback' | 'Coupe' | 'Convertible' | 'Truck';
  videos: string[];
  images: string[];
  description: string;
  location: string;
  status: 'active' | 'inactive' | 'sold';
  seller_id?: string | null;
  brand_id?: string | null;
  seller_type?: 'individual' | 'brand';
  likes_count: number;
  comments_count: number;
  views_count: number;
  created_at: string;
  updated_at: string;
  playback_id?: string;
  thumbnail_url?: string;
  asset_ids?: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  rating: number;
  verified: boolean;
  total_listings: number;
  total_sold: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
} 