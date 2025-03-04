import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";

import { Category } from "@/constants/types/categories.type";

export default function IngredientSelectionForm({
  categories,
}: {
  categories: Category[];
}) {
  const [selectedIngredients, setSelectedIngredients] = useState<any>([]);
  const [showMore, setShowMore] = useState<{ [category: string]: boolean }>({});

  const handleSelect = (ingredient: any) => {
    const cate = categories
      .filter((category) =>
        category.ingredientCategories.some(
          (item: any) => item.ingredient.id === ingredient.id,
        ),
      )
      .map((category) => category.name);

    const newIngredient = {
      id: ingredient.id,
      name: ingredient.ingredientName,
      cate,
    };
    setSelectedIngredients((prev: any) => {
      const isAlreadySelected = prev.some(
        (item: any) => item.id === newIngredient.id,
      );

      if (isAlreadySelected) {
        return prev.filter((item: any) => item.id !== newIngredient.id);
      } else {
        return [...prev, newIngredient];
      }
    });
  };

  const toggleShowMore = (category: string) => {
    setShowMore((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };
  return (
    <ScrollView className="bg-white">
      {categories.map((category) => {
        const ingredientCategories = category.ingredientCategories;
        const isExpanded = showMore[category.name];
        return (
          <View key={category.id}>
            <Text className="pl-3 text-xl font-bold text-black">
              {category.name}
            </Text>
            <View className="flex flex-wrap flex-row">
              {ingredientCategories
                .slice(0, isExpanded ? ingredientCategories.length : 10)
                .map((item: any) => (
                  <TouchableOpacity
                    key={item.ingredient.id}
                    onPress={() => handleSelect(item.ingredient)}
                    className={`m-1 px-3 py-1 rounded-lg inline-flex ${
                      selectedIngredients.some(
                        (selectedItem: any) =>
                          selectedItem.id === item.ingredient.id &&
                          selectedItem.name === item.ingredient.ingredientName,
                      )
                        ? "bg-primary"
                        : "bg-[#f1f2f4]"
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        selectedIngredients.some(
                          (selectedItem: any) =>
                            selectedItem.id === item.ingredient.id &&
                            selectedItem.name ===
                              item.ingredient.ingredientName,
                        )
                          ? "text-white text-lg"
                          : "text-[#909198] text-lg"
                      }`}
                    >
                      {item.ingredient.ingredientName}
                    </Text>
                  </TouchableOpacity>
                ))}

              {ingredientCategories.length > 10 && (
                <TouchableOpacity
                  className="font-medium rounded-lg bg-[#f1f2f4] text-[#909198] items-center justify-center px-3 py-1 m-1"
                  onPress={() => toggleShowMore(category.name)}
                >
                  {isExpanded ? (
                    <View className="flex-row items-center justify-center">
                      <Text>Show Less</Text>
                      <Ionicons name="arrow-up" size={15} color="black" />
                    </View>
                  ) : (
                    <View className="flex-row items-center justify-center">
                      <Text>
                        Show More ({ingredientCategories.length - 10} more)
                      </Text>
                      <Ionicons name="arrow-down" size={15} color="black" />
                    </View>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}
