import { View, Text, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import TextInputComponent from "@/components/input";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Toast from "react-native-toast-message";

import DefaultButton from "@/components/button/button";
import { postRequest } from "@/helpers/api-requests";

import { RootStackParamList } from "../../../constants/types/root-stack";

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [email, setEmail] = useState("");

  const sendEmail = async () => {
    if (!email.includes("@")) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Email không hợp lệ. Vui lòng nhập đúng định dạng email.",
      });
      return;
    }

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
    }
  };

  return (
    <View className="flex-1 p-4 bg-white ">
      <View className=" p-5 rounded-lg ">
        <View className="m-3">
          <TextInputComponent
            label="Email"
            placeholder="Nhập email"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View className="flex flex-row justify-center">
          <DefaultButton
            title="Đăng nhập"
            backgroundColor="black"
            onPress={sendEmail}
          />
        </View>

        <View className="flex flex-row justify-center">
          <Text
            className="text-blue-600 underline pt-3"
            // onPress={() => navigation.navigate("Register")}
          >
            Bạn chưa có tài khoản ?
          </Text>
        </View>
      </View>
    </View>
  );
}
