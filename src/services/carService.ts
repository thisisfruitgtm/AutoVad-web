import { Car } from '@/types/car';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

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
      return data.data || null;
    } catch (error) {
      console.error('Error creating car:', error);
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
      return data.data || null;
    } catch (error) {
      console.error('Error updating car:', error);
      return null;
    }
  },

  async deleteCar(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/cars/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting car:', error);
      return false;
    }
  },
}; 