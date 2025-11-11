import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { favoritesService } from '@/services/favorites';
import type { FavoriteDto } from '@/services/favorites';
import { useAuth } from './authContext';

interface FavoritesContextType {
  favorites: Set<number>; // Set of product IDs
  loading: boolean;
  addToFavorites: (productId: number) => Promise<boolean>;
  removeFromFavorites: (productId: number) => Promise<boolean>;
  isFavorite: (productId: number) => boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const loadFavorites = async () => {
    if (!user) {
      setFavorites(new Set());
      return;
    }

    setLoading(true);
    try {
      const result = await favoritesService.getFavorites();
      if (result.success && result.data) {
        const favoriteIds = new Set(result.data.map((fav: FavoriteDto) => fav.productId));
        setFavorites(favoriteIds);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [user]);

  const addToFavorites = async (productId: number): Promise<boolean> => {
    try {
      const result = await favoritesService.addFavorite(productId);
      if (result.success) {
        setFavorites(prev => new Set(prev).add(productId));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return false;
    }
  };

  const removeFromFavorites = async (productId: number): Promise<boolean> => {
    try {
      const result = await favoritesService.removeFavorite(productId);
      if (result.success) {
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return false;
    }
  };

  const isFavorite = (productId: number): boolean => {
    return favorites.has(productId);
  };

  const refreshFavorites = async () => {
    await loadFavorites();
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        refreshFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
