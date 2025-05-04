import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import BackButton from "./BackButton";

/**
 * A component that showcases the updated UI styling
 * This can be used as a reference for consistent UI across the app
 */
export default function UIStyleGuide() {
  return (
    <ScrollView className="flex-1 bg-neutral">
      <View className="p-lg">
        <Text className="text-2xl font-bold text-neutral-900 mb-xl">
          UI Style Guide
        </Text>

        {/* Color Palette */}
        <Text className="text-xl font-semibold text-neutral-800 mb-md">
          Color Palette
        </Text>

        <Text className="font-medium mb-sm">Primary Colors</Text>
        <View className="flex-row mb-lg">
          <View className="w-20 h-20 bg-primary rounded-md mr-sm">
            <Text className="text-white text-xs p-xs">Primary</Text>
          </View>
          <View className="w-20 h-20 bg-primary-light rounded-md mr-sm">
            <Text className="text-white text-xs p-xs">Primary Light</Text>
          </View>
          <View className="w-20 h-20 bg-primary-dark rounded-md">
            <Text className="text-white text-xs p-xs">Primary Dark</Text>
          </View>
        </View>

        <Text className="font-medium mb-sm">Secondary Colors</Text>
        <View className="flex-row mb-lg">
          <View className="w-20 h-20 bg-secondary rounded-md mr-sm">
            <Text className="text-white text-xs p-xs">Secondary</Text>
          </View>
          <View className="w-20 h-20 bg-secondary-light rounded-md mr-sm">
            <Text className="text-white text-xs p-xs">Secondary Light</Text>
          </View>
          <View className="w-20 h-20 bg-secondary-dark rounded-md">
            <Text className="text-white text-xs p-xs">Secondary Dark</Text>
          </View>
        </View>

        <Text className="font-medium mb-sm">Accent Colors</Text>
        <View className="flex-row mb-lg">
          <View className="w-20 h-20 bg-accent rounded-md mr-sm">
            <Text className="text-white text-xs p-xs">Accent</Text>
          </View>
          <View className="w-20 h-20 bg-accent-light rounded-md mr-sm">
            <Text className="text-white text-xs p-xs">Accent Light</Text>
          </View>
          <View className="w-20 h-20 bg-accent-dark rounded-md">
            <Text className="text-white text-xs p-xs">Accent Dark</Text>
          </View>
        </View>

        <Text className="font-medium mb-sm">Neutral Colors</Text>
        <View className="flex-row flex-wrap mb-lg">
          <View className="w-20 h-20 bg-neutral rounded-md mr-sm mb-sm">
            <Text className="text-neutral-800 text-xs p-xs">Neutral</Text>
          </View>
          <View className="w-20 h-20 bg-neutral-100 rounded-md mr-sm mb-sm">
            <Text className="text-neutral-800 text-xs p-xs">Neutral 100</Text>
          </View>
          <View className="w-20 h-20 bg-neutral-200 rounded-md mr-sm mb-sm">
            <Text className="text-neutral-800 text-xs p-xs">Neutral 200</Text>
          </View>
          <View className="w-20 h-20 bg-neutral-300 rounded-md mr-sm mb-sm">
            <Text className="text-neutral-800 text-xs p-xs">Neutral 300</Text>
          </View>
          <View className="w-20 h-20 bg-neutral-700 rounded-md mr-sm mb-sm">
            <Text className="text-white text-xs p-xs">Neutral 700</Text>
          </View>
          <View className="w-20 h-20 bg-neutral-800 rounded-md mr-sm mb-sm">
            <Text className="text-white text-xs p-xs">Neutral 800</Text>
          </View>
          <View className="w-20 h-20 bg-neutral-900 rounded-md mr-sm mb-sm">
            <Text className="text-white text-xs p-xs">Neutral 900</Text>
          </View>
        </View>

        <Text className="font-medium mb-sm">Status Colors</Text>
        <View className="flex-row mb-lg">
          <View className="w-20 h-20 bg-success rounded-md mr-sm">
            <Text className="text-white text-xs p-xs">Success</Text>
          </View>
          <View className="w-20 h-20 bg-warning rounded-md mr-sm">
            <Text className="text-white text-xs p-xs">Warning</Text>
          </View>
          <View className="w-20 h-20 bg-error rounded-md mr-sm">
            <Text className="text-white text-xs p-xs">Error</Text>
          </View>
          <View className="w-20 h-20 bg-info rounded-md">
            <Text className="text-white text-xs p-xs">Info</Text>
          </View>
        </View>

        {/* Navigation Elements */}
        <Text className="text-xl font-semibold text-neutral-800 mb-md">
          Navigation Elements
        </Text>

        <Text className="font-medium mb-sm">Back Button</Text>
        <View className="flex-row items-center mb-lg">
          <BackButton />
          <Text className="ml-md">Standard Back Button</Text>
        </View>

        {/* Buttons */}
        <Text className="text-xl font-semibold text-neutral-800 mb-md">
          Buttons
        </Text>

        <View className="mb-lg">
          <TouchableOpacity className="bg-primary py-sm px-md rounded-md mb-sm">
            <Text className="text-white font-medium text-center">
              Primary Button
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-secondary py-sm px-md rounded-md mb-sm">
            <Text className="text-white font-medium text-center">
              Secondary Button
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-accent py-sm px-md rounded-md mb-sm">
            <Text className="text-white font-medium text-center">
              Accent Button
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-transparent border border-primary py-sm px-md rounded-md mb-sm">
            <Text className="text-primary font-medium text-center">
              Outline Button
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-neutral-100 py-sm px-md rounded-md">
            <Text className="text-neutral-800 font-medium text-center">
              Neutral Button
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
