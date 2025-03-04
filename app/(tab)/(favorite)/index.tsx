import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useTheme } from "@rneui/themed";
import { useNavigation } from "@react-navigation/native";

import chess_banner from "../../../assets/images/Cards/chess_banner.jpg";
import SearchInput from "@/components/input/search_input";
import { useFavorites } from "@/context/FavoritesContext";
import CardFood from "@/components/cards/card_food";
import ButtonWithIcon from "@/components/button/button_with_icon";

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();

  const { favorites, clearFavorites } = useFavorites();
  const [searchInput, setSearchInput] = useState<string>("");
  const [filteredFavorites, setFilteredFavorites] = useState(favorites);

  const handleSearch = (searchTerm: string) => {
    setSearchInput(searchTerm);
  };

  useEffect(() => {
    if (searchInput) {
      const filtered = favorites.filter((recipe) =>
        recipe.name.toLowerCase().includes(searchInput.toLowerCase()),
      );
      setFilteredFavorites(filtered);
    } else {
      setFilteredFavorites(favorites);
    }
  }, [searchInput, favorites]);

  return (
    <>
      <ImageBackground
        source={chess_banner}
        style={{ width: "100%", height: 150, backgroundColor: "#F05193" }}
        resizeMode="cover"
      >
        <View className="flex-row items-center absolute inset-x-0 bottom-0 h-16 px-5">
          <View className="flex-1">
            <SearchInput onSearch={handleSearch} />
          </View>
          <View className="ml-3">
            <ButtonWithIcon
              iconName="filter"
              backgroundColor="white"
              iconColor={theme.colors.primary}
              onPress={() => navigation.navigate("Filter")}
            />
          </View>
        </View>
      </ImageBackground>

      <ScrollView className="bg-white">
        <View className="flex-row justify-around items-center pt-5">
          <Text className="text-3xl font-bold">
            Favorite({filteredFavorites.length})
          </Text>
          {filteredFavorites.length ? (
            <ButtonWithIcon
              onPress={() => clearFavorites()}
              iconName="trash"
              title="Clear All"
              backgroundColor={theme.colors.primary}
              iconColor="white"
            />
          ) : (
            <></>
          )}
        </View>

        {filteredFavorites.length ? (
          <View className="pt-[-10]">
            {filteredFavorites.map((recipe) => (
              <TouchableOpacity key={recipe.id}>
                <CardFood key={recipe.id} recipe={recipe} />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text className="text-xl italic text-center pl-5 pt-5">
            No favorite found
          </Text>
        )}
      </ScrollView>
    </>
  );
}
