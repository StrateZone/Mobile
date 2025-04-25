import React from "react";
import { View } from "react-native";
import { Input } from "@rneui/themed";

type TextInputProps = {
  label?: string;
  value?: string;
  secureTextEntry?: boolean;
  errorMessage?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  rightIcon?: any;
};

export default function TextInputComponent({
  label,
  value,
  secureTextEntry,
  errorMessage,
  onChangeText,
  placeholder,
  rightIcon,
}: TextInputProps) {
  return (
    <View style={{ marginVertical: 8 }}>
      <Input
        label={label}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        errorMessage={errorMessage}
        rightIcon={rightIcon}
        containerStyle={{ paddingHorizontal: 0 }}
        inputContainerStyle={{
          borderBottomWidth: 1,
          borderBottomColor: "#ccc",
        }}
      />
    </View>
  );
}
