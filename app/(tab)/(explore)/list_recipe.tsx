import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@rneui/themed";

import chess_banner from "../../../assets/images/Cards/chess_banner.jpg";
import { getRequest } from "@/helpers/api-requests";
import CardFood from "@/components/cards/card_food";
import SearchInput from "@/components/input/search_input";
import ButtonWithIcon from "@/components/button/button_with_icon";
import GroupButton from "../../../components/group-button/index";

import { Recipe } from "../../../constants/types/recipes.type";
import { Occasion } from "../../../constants/types/occasion.type";

export default function ListRecipeScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [occasion, setOccasion] = useState<Occasion[]>([]);
  const [selectedOccasionIndex, setSelectedOccasionIndex] =
    useState<number>(-1);
  const [selectedOccasionName, setSelectedOccasionName] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");

  const handleSearch = (searchTerm: string) => {
    setSearchInput(searchTerm);
  };

  useEffect(() => {
    getRequest("/recipes", {
      "search-value": searchInput,
      "occasion-name": selectedOccasionName,
      "page-size": 1000,
    })
      .then((response) => {
        setRecipes(response.recipes);
      })
      .catch(() => {});
  }, [searchInput, selectedOccasionName]);

  useEffect(() => {
    getRequest("/occasions/all", {})
      .then((data) => {
        setOccasion(data);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <View>
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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ backgroundColor: "white" }}
        >
          <GroupButton
            data={occasion}
            selectedDataIndex={selectedOccasionIndex}
            setSelectedDataIndex={setSelectedOccasionIndex}
            setSelectedDataName={setSelectedOccasionName}
          />
        </ScrollView>
      </View>

      <ScrollView className="bg-white">
        <View className="">
          {recipes.map((recipe) => (
            <TouchableOpacity key={recipe.id}>
              <CardFood recipe={recipe} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </>
  );
}
