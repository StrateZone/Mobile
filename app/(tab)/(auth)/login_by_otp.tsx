import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import React, { useState } from "react";
import TextInputComponent from "@/components/input";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";

import DefaultButton from "@/components/button/button";
import { RootStackParamList } from "../../../constants/types/root-stack";
import { postRequest } from "@/helpers/api-requests";
import { Fold } from "react-native-animated-spinkit";

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoginByOtpScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const sendEmail = async () => {
    if (!email.includes("@")) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Email không hợp lệ. Vui lòng nhập đúng định dạng email.",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await postRequest("/auth/send-otp", {}, { email });

      if (response.status === 200) {
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: `Mã OTP đã được gửi tới ${email}. Vui lòng kiểm tra email.`,
        });

        setTimeout(() => {
          navigation.navigate("Otp", { email });
        }, 1500);
      } else {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: "Email không tồn tại trong hệ thống. Vui lòng kiểm tra lại.",
        });
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Đã xảy ra lỗi khi gửi email. Vui lòng thử lại.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="relative">
        <TouchableOpacity
          className="absolute left-4 top-2 p-2 bg-gray-300 rounded-full z-10"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-center text-black mb-5 mt-3">
          Đăng nhập bằng OTP
        </Text>
      </View>

      <View className="p-5 rounded-lg">
        <View className="m-3">
          <TextInputComponent
            label="Email"
            placeholder="Nhập email"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View className="flex flex-row justify-center mt-4">
          <DefaultButton
            title={loading ? "Đang xử lý..." : "Đăng nhập"}
            backgroundColor="black"
            onPress={sendEmail}
            disabled={loading}
            icon={loading ? <Fold size={18} color="#000000" /> : undefined}
          />
        </View>

        <View className="flex flex-row justify-center">
          <TouchableOpacity
            className="text-blue-600 underline pt-3"
            onPress={() => navigation.navigate("Register")}
          >
            <Text>Bạn chưa có tài khoản?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
