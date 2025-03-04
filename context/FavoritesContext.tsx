import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Recipe } from "@/constants/types/recipes.type";

interface FavoritesContextType {
  favorites: Recipe[];
  addToFavorites: (item: Recipe) => Promise<void>;
  removeFromFavorites: (id: number) => Promise<void>;
  clearFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined,
);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider = ({ children }: FavoritesProviderProps) => {
  const [favorites, setFavorites] = useState<Recipe[]>([]);

  useEffect(() => {
    const loadFavorites = async () => {
      const storedFavorites = await AsyncStorage.getItem("favorites");
      setFavorites(storedFavorites ? JSON.parse(storedFavorites) : []);
    };
    loadFavorites();
  }, []);

  const addToFavorites = async (item: Recipe) => {
    const isAlreadyFavorite = favorites.some((fav) => fav.id === item.id);
    if (!isAlreadyFavorite) {
      const updatedFavorites = [...favorites, item];
      setFavorites(updatedFavorites);
      await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    }
  };

  const removeFromFavorites = async (id: number) => {
    const updatedFavorites = favorites.filter((item) => item.id !== id);
    setFavorites(updatedFavorites);
    await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  const clearFavorites = async () => {
    setFavorites([]);
    await AsyncStorage.removeItem("favorites");
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, addToFavorites, removeFromFavorites, clearFavorites }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};
