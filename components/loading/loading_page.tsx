import { View, Text } from "react-native";
import React from "react";
import { Fold } from "react-native-animated-spinkit";

export default function LoadingPage() {
  return (
    <View className="flex justify-center items-center mt-32">
      <Fold size={48} color="#3B82F6" />
    </View>
  );
}
