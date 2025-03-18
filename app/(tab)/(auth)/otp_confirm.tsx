import React, { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRoute } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useAuth } from "@/context/auth-context";

import { RootStackParamList } from "../../../constants/types/root-stack";

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function OtpConfirmScreen() {
  const route = useRoute();
  const { email } = route.params as { email: string };
  const navigation = useNavigation<NavigationProp>();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const handleChangeText = (text: string, index: number) => {
    if (!/^\d$/.test(text) && text !== "") return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (event: any, index: number) => {
    if (
      event.nativeEvent.key === "Backspace" &&
      otp[index] === "" &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const { onLogin } = useAuth();
  const otpString = otp.join("");
  const login = async () => {
    try {
      const result = await onLogin!(email, otpString);

      if (result.success) {
        Toast.show({
          type: "success",
          text1: "Đăng nhập thành công!",
        });

        navigation.reset({
          index: 0,
          routes: [{ name: "Profile" }],
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Lỗi đăng nhập",
          text2: result.message || "OTP không hợp lệ, vui lòng thử lại.",
        });
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi hệ thống",
        text2: "Đã có lỗi xảy ra, vui lòng thử lại sau.",
      });
    }
  };

  return (
    <View className="flex-1 bg-gray-100 justify-center items-center px-4">
      <TouchableOpacity
        className="absolute top-12 left-5 p-2 bg-gray-300 rounded-full"
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <View className="flex-row justify-center space-x-2 mb-6">
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            className="w-12 h-12 border-2 border-gray-500 rounded-md text-xl text-center font-semibold"
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={(event) => handleKeyPress(event, index)}
          />
        ))}
      </View>

      <TouchableOpacity
        className="w-14 h-14 bg-gray-400 rounded-full flex items-center justify-center"
        onPress={login}
      >
        <Ionicons name="arrow-forward" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}
