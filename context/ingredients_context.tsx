"use client";
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const IngredientsContext = createContext<any[]>([]);

export const IngredientsProvider = ({ children }: any) => {
  const [selectedIngredients, setSelectedIngredients] = useState<any[]>([]);

  useEffect(() => {
    const loadIngredients = async () => {
      try {
        const savedIngredients = await AsyncStorage.getItem(
          "selectedIngredients",
        );
        if (savedIngredients) {
          setSelectedIngredients(JSON.parse(savedIngredients));
        }
      } catch (error) {
        console.error("Error loading ingredients:", error);
      }
    };

    loadIngredients();
  }, []);

  useEffect(() => {
    const saveIngredients = async () => {
      try {
        if (selectedIngredients.length > 0) {
          await AsyncStorage.setItem(
            "selectedIngredients",
            JSON.stringify(selectedIngredients),
          );
        } else {
          await AsyncStorage.removeItem("selectedIngredients");
        }
      } catch (error) {
        console.error("Error saving ingredients:", error);
      }
    };

    saveIngredients();
  }, [selectedIngredients]);

  return (
    <IngredientsContext.Provider
      value={[selectedIngredients, setSelectedIngredients]}
    >
      {children}
    </IngredientsContext.Provider>
  );
};
