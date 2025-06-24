import { Car } from '@/types/car';
import { getMuxVideoUrl, getMuxThumbnailUrl } from '@/lib/utils';
import { trackCarPost } from '@/lib/analytics';

const API_BASE_URL = '/api';

// Utility function for retrying API calls with exponential backoff
async function fetchWithRetry(
  url: string, 
  options?: RequestInit, 
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      if (response.ok) {
        return response;
      }

      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw lastError;
      }

    } catch (error) {
      // Don't retry if request was aborted
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Wait before retry with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
}

// Define the raw car data structure from API
interface RawCarData {
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
  description: string;
  location: string;
  status: 'active' | 'inactive' | 'sold';
  created_at: string;
  likes_count: number;
  comments_count: number;
  images?: string[];
  videos?: string[];
  playback_id?: string;
  thumbnail_url?: string;
  asset_ids?: string[];
}

export const carService = {
  async getCars(page: number = 1, limit: number = 20): Promise<{ data: Car[], hasMore: boolean, totalCount: number }> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/cars?page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch cars: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Transform data - following React Native approach where media is already included
      const transformedCars: Car[] = (result.data || []).map((car: RawCarData) => ({
        ...car,
        images: car.images || [],
        videos: car.videos || [],
        asset_ids: car.asset_ids || [],
        seller: {
          id: 'autovad-verified',
          name: 'Autovad Verified',
          avatar_url: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
          rating: 4.9,
          verified: true,
        },
        is_liked: false,
      }));
      
      // Transform cars to convert Mux playback IDs to proper URLs (like React Native does)
      const transformedCarsWithUrls = transformedCars.map((car: Car) => ({
        ...car,
        videos: car.videos?.map((video: string) => getMuxVideoUrl(video)) || [],
        thumbnail_url: car.thumbnail_url, // Already a full URL from database
      }));
      
      return {
        data: transformedCarsWithUrls,
        hasMore: result.hasMore || false,
        totalCount: result.totalCount || 0
      };
    } catch (error) {
      console.error('Error fetching cars:', error);
      return { data: [], hasMore: false, totalCount: 0 };
    }
  },

  // Remove getCarMedia function - not needed like in React Native
  // Media comes directly with car data

  async getCarById(id: string): Promise<Car | null> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/cars/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch car');
      }
      const result = await response.json();
      const car = result.data;
      
      if (!car) return null;
      
      // Transform single car data like we do in getCars
      return {
        ...car,
        images: car.images || [],
        videos: car.videos?.map((video: string) => getMuxVideoUrl(video)) || [],
        thumbnail_url: car.thumbnail_url, // Already a full URL from database
        seller: car.seller || {
          id: 'autovad-verified',
          name: 'Autovad Verified',
          avatar_url: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
          rating: 4.9,
          verified: true,
        },
        is_liked: car.is_liked || false,
      };
    } catch (error) {
      console.error('Error fetching car:', error);
      return null;
    }
  },

  async searchCars(query: string, page: number = 1, limit: number = 20): Promise<{ data: Car[], hasMore: boolean, totalCount: number }> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/cars?search=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Failed to search cars: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Transform data the same way as getCars
      const transformedCars: Car[] = (result.data || []).map((car: RawCarData) => ({
        ...car,
        images: car.images || [],
        videos: car.videos || [],
        asset_ids: car.asset_ids || [],
        seller: {
          id: 'autovad-verified',
          name: 'Autovad Verified',
          avatar_url: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
          rating: 4.9,
          verified: true,
        },
        is_liked: false,
      }));
      
      // Transform cars to convert Mux playback IDs to proper URLs
      const transformedCarsWithUrls = transformedCars.map((car: Car) => ({
        ...car,
        videos: car.videos?.map((video: string) => getMuxVideoUrl(video)) || [],
        thumbnail_url: car.thumbnail_url, // Already a full URL from database
      }));
      
      return {
        data: transformedCarsWithUrls,
        hasMore: result.hasMore || false,
        totalCount: result.totalCount || 0
      };
    } catch (error) {
      console.error('Error searching cars:', error);
      return { data: [], hasMore: false, totalCount: 0 };
    }
  },

  async createCar(carData: Omit<Car, 'id'>): Promise<Car | null> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/cars`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(carData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create car');
      }
      
      const data = await response.json();
      const createdCar = data.data || null;
      
      if (createdCar) {
        // Track successful car creation
        trackCarPost({
          carId: createdCar.id,
          carTitle: `${createdCar.make} ${createdCar.model}`,
          carBrand: createdCar.make,
          carModel: createdCar.model,
          carYear: createdCar.year,
          carPrice: createdCar.price,
          hasImages: createdCar.images && createdCar.images.length > 0,
          hasVideos: createdCar.videos && createdCar.videos.length > 0,
          imagesCount: createdCar.images?.length || 0,
          videosCount: createdCar.videos?.length || 0,
          action: 'create',
          success: true,
        });
      }
      
      return createdCar;
    } catch (error) {
      console.error('Error creating car:', error);
      
      // Track failed car creation
      trackCarPost({
        carTitle: `${carData.make} ${carData.model}`,
        carBrand: carData.make,
        carModel: carData.model,
        carYear: carData.year,
        carPrice: carData.price,
        hasImages: carData.images && carData.images.length > 0,
        hasVideos: carData.videos && carData.videos.length > 0,
        imagesCount: carData.images?.length || 0,
        videosCount: carData.videos?.length || 0,
        action: 'create',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      return null;
    }
  },

  async updateCar(id: string, carData: Partial<Car>): Promise<Car | null> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/cars/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(carData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update car');
      }
      
      const data = await response.json();
      const updatedCar = data.data || null;
      
      if (updatedCar) {
        // Track successful car update
        trackCarPost({
          carId: updatedCar.id,
          carTitle: `${updatedCar.make} ${updatedCar.model}`,
          carBrand: updatedCar.make,
          carModel: updatedCar.model,
          carYear: updatedCar.year,
          carPrice: updatedCar.price,
          hasImages: updatedCar.images && updatedCar.images.length > 0,
          hasVideos: updatedCar.videos && updatedCar.videos.length > 0,
          imagesCount: updatedCar.images?.length || 0,
          videosCount: updatedCar.videos?.length || 0,
          action: 'edit',
          success: true,
        });
      }
      
      return updatedCar;
    } catch (error) {
      console.error('Error updating car:', error);
      
      // Track failed car update
      trackCarPost({
        carId: id,
        carTitle: carData.make && carData.model ? `${carData.make} ${carData.model}` : undefined,
        carBrand: carData.make,
        carModel: carData.model,
        carYear: carData.year,
        carPrice: carData.price,
        hasImages: Boolean(carData.images && carData.images.length > 0),
        hasVideos: Boolean(carData.videos && carData.videos.length > 0),
        imagesCount: carData.images?.length || 0,
        videosCount: carData.videos?.length || 0,
        action: 'edit',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      return null;
    }
  },

  async deleteCar(id: string): Promise<boolean> {
    try {
      const response = await fetchWithRetry(`${API_BASE_URL}/cars/${id}`, {
        method: 'DELETE',
      });
      
      const success = response.ok;
      
      if (success) {
        // Track successful car deletion
        trackCarPost({
          carId: id,
          action: 'delete',
          hasImages: false,
          hasVideos: false,
          success: true,
        });
      } else {
        // Track failed car deletion
        trackCarPost({
          carId: id,
          action: 'delete',
          hasImages: false,
          hasVideos: false,
          success: false,
          error: 'Failed to delete car',
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting car:', error);
      
      // Track failed car deletion
      trackCarPost({
        carId: id,
        action: 'delete',
        hasImages: false,
        hasVideos: false,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      return false;
    }
  },
};

export const uploadVideo = async (file: File): Promise<{ uploadId: string; url: string }> => {
  try {
    console.log('🚀 Starting video upload...')
    console.log('🔗 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('🔑 Anon key present:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    // Create upload using Supabase Edge Function
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/mux-handler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      },
      body: JSON.stringify({ action: 'create_upload' }),
    })

    console.log('📊 Response status:', response.status)
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Upload creation failed:', response.status, errorText)
      throw new Error(`Failed to create upload: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ Upload created successfully:', result)
    
    const { url, uploadId } = result
    
    // Upload file to Mux
    console.log('📤 Uploading file to Mux...')
    const uploadResponse = await fetch(url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    })

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload file: ${uploadResponse.status}`)
    }

    console.log('✅ File uploaded successfully')
    return { uploadId, url }
  } catch (error) {
    console.error('❌ Upload error:', error)
    throw error
  }
}

export const getAssetId = async (uploadId: string): Promise<{ assetId: string; uploadStatus: string }> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/mux-handler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      },
      body: JSON.stringify({ action: 'get_asset_id', uploadId }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Get asset ID failed:', response.status, errorText)
      throw new Error(`Failed to get asset ID: ${response.status} - ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Get asset ID error:', error)
    throw error
  }
}

export const pollAsset = async (assetId: string): Promise<{ status: string; playbackId?: string; processing?: boolean }> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/mux-handler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      },
      body: JSON.stringify({ action: 'poll_asset', assetId }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Poll asset failed:', response.status, errorText)
      throw new Error(`Failed to poll asset: ${response.status} - ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Poll asset error:', error)
    throw error
  }
} 