import React from "react";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

type BackButtonProps = {
  customAction?: () => void;
  color?: string;
  size?: number;
  style?: string;
};

/**
 * A consistent back button component for use across the application
 *
 * @param customAction Optional custom action to override default navigation.goBack()
 * @param color Optional color override (defaults to primary color)
 * @param size Optional icon size override
 * @param style Optional additional Tailwind classes
 */
export default function BackButton({
  customAction,
  color = "#4A6FA5",
  size = 24,
  style = "",
}: BackButtonProps) {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={customAction || (() => navigation.goBack())}
      className={`p-2 rounded-full bg-neutral-100 active:bg-neutral-200 ${style}`}
      activeOpacity={0.7}
    >
      <Ionicons name="chevron-back" size={size} color={color} />
    </TouchableOpacity>
  );
}
