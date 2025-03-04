import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Card, Icon } from "@rneui/themed";

import { useFavorites } from "@/context/FavoritesContext";

import { Recipe } from "@/constants/types/recipes.type";

const cookingTimes = [25, 30, 35, 40, 45];
const servings = [4, 5, 6, 7, 8, 9, 10];

export default function MyCard({ recipe }: { recipe: Recipe }) {
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();

  const isFavorite = favorites.some((fav) => fav.id === recipe.id);

  const randomCookingTime =
    cookingTimes[Math.floor(Math.random() * cookingTimes.length)];
  const cookingTime = recipe.cookingTime || `${randomCookingTime} min`;
  const randomserving = servings[Math.floor(Math.random() * servings.length)];
  const serving = recipe.serving || `${randomserving}`;

  const toggleFavorite = () => {
    if (isFavorite) {
      removeFromFavorites(recipe.id);
    } else {
      addToFavorites(recipe);
    }
  };

  return (
    <Card
      containerStyle={{
        borderWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
        shadowRadius: 0,
      }}
    >
      <View className="relative flex-1">
        <TouchableOpacity
          onPress={toggleFavorite}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 1,
          }}
        >
          <Icon
            name="heart"
            type="font-awesome"
            size={30}
            color={isFavorite ? "red" : "gray"}
          />
        </TouchableOpacity>

        <Image
          style={{
            width: "100%",
            height: 200,
            borderRadius: 20,
          }}
          resizeMode="cover"
          source={{
            uri: recipe.imageUrl,
          }}
        />

        <View className="absolute bottom-3 left-5 rounded-xl bg-white px-3">
          <Text className="text-black font-bold p-1">{cookingTime}</Text>
        </View>
      </View>

      <Card.Title style={{ fontSize: 20, textAlign: "left", paddingTop: 10 }}>
        {recipe.name}
      </Card.Title>

      <Text className="text-xl color-[#8E8E93] my-[-10] mb-[-20]">
        Occasion: {recipe.occasionName}
      </Text>
    </Card>
  );
}
