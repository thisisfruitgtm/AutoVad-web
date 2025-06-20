import { Car } from '@/types/car';
import { trackCarPost } from '@/lib/analytics';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const carService = {
  async getCars(): Promise<Car[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/cars`);
      if (!response.ok) {
        throw new Error('Failed to fetch cars');
      }
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching cars:', error);
      return [];
    }
  },

  async getCarById(id: string): Promise<Car | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/cars/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch car');
      }
      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error fetching car:', error);
      return null;
    }
  },

  async searchCars(query: string): Promise<Car[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/cars?search=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to search cars');
      }
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error searching cars:', error);
      return [];
    }
  },

  async createCar(carData: Omit<Car, 'id'>): Promise<Car | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/cars`, {
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
      const response = await fetch(`${API_BASE_URL}/cars/${id}`, {
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
      const response = await fetch(`${API_BASE_URL}/cars/${id}`, {
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