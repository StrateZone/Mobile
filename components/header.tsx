import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

type HeaderProps = {
  title: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
};

export default function Header({
  title,
  showBackButton = true,
  rightComponent,
}: HeaderProps) {
  const navigation = useNavigation();

  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-neutral shadow-sm">
      <View className="flex-row items-center flex-1">
        {showBackButton && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-3 p-2 rounded-full bg-neutral-100 active:bg-neutral-200"
            activeOpacity={0.7}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color="#4A6FA5" /* primary color */
            />
          </TouchableOpacity>
        )}
        <Text className="text-xl font-semibold text-neutral-800 flex-1">
          {title}
        </Text>
      </View>
      {rightComponent && <View>{rightComponent}</View>}
    </View>
  );
}
