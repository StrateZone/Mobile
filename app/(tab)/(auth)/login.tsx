import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import TextInputComponent from "@/components/input";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Toast from "react-native-toast-message";

import DefaultButton from "@/components/button/button";
import { postRequest } from "@/helpers/api-requests";

import { RootStackParamList } from "../../../constants/types/root-stack";
import { useAuth } from "@/context/auth-context";

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();

  const { onLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  function validatePassword(password: string): string | null {
    if (!password) {
      return "Mật khẩu không được để trống.";
    }

    if (password.length < 8) {
      return "Mật khẩu phải có ít nhất 8 kí tự.";
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

    if (!hasUppercase) {
      return "Mật khẩu phải chứa ít nhất một chữ in hoa.";
    }

    if (!hasLowercase) {
      return "Mật khẩu phải chứa ít nhất một chữ in thường.";
    }

    if (!hasDigit) {
      return "Mật khẩu phải chứa ít nhất một chữ số.";
    }

    if (!hasSpecialChar) {
      return "Mật khẩu phải chứa ít nhất một kí tự đặc biệt.";
    }

    return null;
  }
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    const error = validatePassword(text);
    setPasswordError(error || "");
  };

  // const sendEmail = async () => {
  //   if (!email.includes("@")) {
  //     Toast.show({
  //       type: "error",
  //       text1: "Lỗi",
  //       text2: "Email không hợp lệ. Vui lòng nhập đúng định dạng email.",
  //     });
  //     return;
  //   }

  //   try {
  //     const response = await postRequest("/auth/send-otp", {}, { email });

  //     if (response.status === 200) {
  //       Toast.show({
  //         type: "success",
  //         text1: "Thành công",
  //         text2: `Mã OTP đã được gửi tới ${email}. Vui lòng kiểm tra email.`,
  //       });

  //       setTimeout(() => {
  //         navigation.navigate("Otp", { email });
  //       }, 1500);
  //     } else {
  //       Toast.show({
  //         type: "error",
  //         text1: "Lỗi",
  //         text2: "Email không tồn tại trong hệ thống. Vui lòng kiểm tra lại.",
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Lỗi đăng nhập:", error);
  //     Toast.show({
  //       type: "error",
  //       text1: "Lỗi",
  //       text2: "Đã xảy ra lỗi khi gửi email. Vui lòng thử lại.",
  //     });
  //   }
  // };

  const handleLogin = async () => {
    try {
      const result = await onLogin!(email, password);
      if (result.success) {
        Toast.show({ type: "success", text1: "Đăng nhập thành công!" });
        navigation.navigate("Profile", {
          screen: "profile",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Lỗi đăng nhập",
          text2: result.data.msg || "Sai tên đăng nhập hoặc mật khẩu",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Lỗi hệ thống",
        text2: "Vui lòng thử lại sau.",
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

        <View className="m-3">
          <TextInputComponent
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry
          />
          {passwordError ? (
            <Text className="text-red-500">{passwordError}</Text>
          ) : null}
        </View>

        <View className="flex flex-row justify-center">
          <DefaultButton
            title="Đăng nhập"
            backgroundColor="black"
            onPress={handleLogin}
          />
        </View>

        <View className="flex flex-row justify-center">
          <TouchableOpacity
            className="text-blue-600 underline pt-3"
            onPress={() => navigation.navigate("Register")}
          >
            <Text>Bạn chưa có tài khoản ?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
