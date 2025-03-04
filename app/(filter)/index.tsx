import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

import chess_banner from "../../assets/images/Cards/chess_banner.jpg";
import GroupButton from "@/components/group-button";

import { recipeCriteria } from "../../constants/recipe_criteria";

export default function FilterScreen() {
  const navigation = useNavigation();

  const [selectedrecipeCriteriaIndex, setSelectedrecipeCriteriaIndex] =
    useState<number>(-1);
  const [selectedrecipeCriteriaName, setSelectedrecipeCriteriaName] =
    useState<string>("");

  return (
    <ScrollView>
      <ImageBackground
        source={chess_banner}
        style={{ width: "100%", height: 130, backgroundColor: "#F05193" }}
        resizeMode="cover"
      >
        <View className="flex-row justify-between items-center px-5 pt-10 flex-1">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>

          <Text className="text-2xl font-bold text-white">Filter Recipe</Text>

          <View style={{ width: 28 }} />
        </View>
      </ImageBackground>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ backgroundColor: "white" }}
      >
        <GroupButton
          data={recipeCriteria}
          selectedDataIndex={selectedrecipeCriteriaIndex}
          setSelectedDataIndex={setSelectedrecipeCriteriaIndex}
          setSelectedDataName={setSelectedrecipeCriteriaName}
        />
      </ScrollView>

      <View>
        <Text>Filter Here</Text>
      </View>
    </ScrollView>
  );
}
