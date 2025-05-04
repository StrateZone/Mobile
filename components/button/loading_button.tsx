import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Fold } from "react-native-animated-spinkit";
import LoadingForButton from "../loading/loading_button";

type LoadingButtonProps = {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  buttonStyle?: any;
  titleStyle?: any;
  loadingText?: string;
};

export default function LoadingButton({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  buttonStyle,
  titleStyle,
  loadingText = "Đang xử lý...",
}: LoadingButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading || disabled}
      style={[
        {
          opacity: isLoading || disabled ? 0.7 : 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 10,
        },
        buttonStyle,
      ]}
    >
      {isLoading ? (
        <>
          <LoadingForButton />
          <Text style={[{ marginLeft: 8, color: "white" }, titleStyle]}>
            {loadingText}
          </Text>
        </>
      ) : (
        <Text style={[{ color: "white" }, titleStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
