import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Toast from "react-native-toast-message";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useAuth } from "@/context/auth-context";
import { RootStackParamList } from "../../../constants/types/root-stack";
import { Fold } from "react-native-animated-spinkit";

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type ConfirmOtpRouteProp = RouteProp<RootStackParamList, "Otp">;

export default function OtpConfirmScreen({
  route,
}: {
  route: ConfirmOtpRouteProp;
}) {
  const navigation = useNavigation<NavigationProp>();
  const { email } = route.params;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isExpired, setIsExpired] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

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

  const { onLoginByOtp } = useAuth();
  const otpString = otp.join("");

  const login = async () => {
    if (isExpired) {
      Toast.show({
        type: "error",
        text1: "OTP đã hết hạn",
        text2: "Vui lòng yêu cầu mã OTP mới.",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await onLoginByOtp!(email, otpString);
      if (result.success) {
        Toast.show({ type: "success", text1: "Đăng nhập thành công!" });
        navigation.navigate("Profile", {
          screen: "profile",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Lỗi đăng nhập",
          text2: result.message || "OTP không hợp lệ.",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Lỗi hệ thống",
        text2: "Vui lòng thử lại sau.",
      });
    } finally {
      setLoading(false); // Đặt loading thành false khi hoàn tất
    }
  };

  const resendOtp = () => {
    setTimeLeft(300);
    setIsExpired(false);
    Toast.show({
      type: "info",
      text1: "Đã gửi lại OTP!",
      text2: "Vui lòng kiểm tra email.",
    });
  };

  return (
    <View className="flex-1 bg-gray-100 justify-center items-center px-4">
      <TouchableOpacity
        className="absolute top-12 left-5 p-2 bg-gray-300 rounded-full"
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <Text className="text-lg font-semibold mb-2">Nhập mã OTP</Text>

      <Text className={`mb-4 ${isExpired ? "text-red-500" : "text-gray-500"}`}>
        {isExpired
          ? "OTP đã hết hạn"
          : `OTP hết hạn sau: ${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`}
      </Text>

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
        className={`w-14 h-14 rounded-full flex items-center justify-center ${isExpired || loading ? "bg-gray-300" : "bg-gray-400"}`}
        onPress={login}
        disabled={isExpired || loading}
      >
        {loading ? (
          <Fold size={18} color="#000000" />
        ) : (
          <Ionicons name="arrow-forward" size={24} color="white" />
        )}
      </TouchableOpacity>

      {isExpired && (
        <TouchableOpacity onPress={resendOtp} className="mt-4">
          <Text className="text-blue-500">Gửi lại OTP</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
