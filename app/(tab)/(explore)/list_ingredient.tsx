import { View, Text, ImageBackground, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "expo-router";

import chess_banner from "../../../assets/images/Cards/chess_banner.jpg";
import SearchInput from "../../../components/input/search_input";
import IngredientSelectionForm from "@/components/form/ingredient_selection";
import { getRequest } from "@/helpers/api-requests";
import { Category } from "@/constants/types/categories.type";

export default function ListIngredientScreen() {
  const navigation = useNavigation();

  const [categories, setCategories] = useState<Category[]>([]);
  const [searchInput, setSearchInput] = useState<string>("");

  const handleSearch = (searchTerm: string) => {
    setSearchInput(searchTerm);
  };

  useEffect(() => {
    getRequest("/categories/all", {})
      .then((category) => {
        setCategories(category);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <ImageBackground
        source={chess_banner}
        style={{ width: "100%", height: 130, backgroundColor: "#F05193" }}
        resizeMode="cover"
      >
        <View className="flex-row justify-between items-center px-5 pt-10 flex-1">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>

          <Text className="text-2xl font-bold text-white">
            Find by ingredient
          </Text>

          <View style={{ width: 28 }} />
        </View>
        <View className="absolute inset-x-0 bottom-0 h-16 px-5"></View>
      </ImageBackground>
      <SearchInput onSearch={handleSearch} />

      <IngredientSelectionForm categories={categories} />
    </>
  );
}
