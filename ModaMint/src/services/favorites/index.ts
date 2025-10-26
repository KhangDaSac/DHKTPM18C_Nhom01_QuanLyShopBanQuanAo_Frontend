import axios from 'axios';
import type { ApiResponse } from '../authentication';

export interface FavoriteDto {
  id: number;
  productId: number;
  productName?: string;
  price?: number;
}

const favClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

favClient.interceptors.request.use((config) => {
  const authDataStr = localStorage.getItem('authData');
  if (authDataStr) {
    try {
      const authData = JSON.parse(authDataStr);
      if (authData?.accessToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${authData.accessToken}`;
      }
    } catch (e) {
      // ignore
    }
  }
  return config;
});

class FavoritesService {
  async getFavorites(): Promise<{ success: boolean; data?: FavoriteDto[]; message?: string }> {
    try {
      const resp = await favClient.get<ApiResponse<FavoriteDto[]>>('/favorites');
      if (resp.data.code !== undefined && resp.data.code !== 1000) {
        return { success: false, message: resp.data.message };
      }
      return { success: true, data: resp.data.result };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error' };
    }
  }

  async addFavorite(productId: number) {
    try {
      const resp = await favClient.post<ApiResponse<FavoriteDto>>('/favorites', { productId });
      return { success: true, data: resp.data.result };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error' };
    }
  }

  async removeFavorite(productId: number) {
    try {
      const resp = await favClient.delete<ApiResponse<void>>(`/favorites/${productId}`);
      return { success: true, message: resp.data.message };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error' };
    }
  }
}

export const favoritesService = new FavoritesService();
