import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import React, { useState } from "react";
import TextInputComponent from "@/components/input";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Toast from "react-native-toast-message";
import Ionicons from "@expo/vector-icons/Ionicons";

import DefaultButton from "@/components/button/button";
import { postRequest } from "@/helpers/api-requests";
import { CheckBox } from "@rneui/themed";

import { RootStackParamList } from "../../../constants/types/root-stack";
import { ScrollView } from "react-native-gesture-handler";

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("male");
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

  const handleRegister = async () => {
    if (!email.includes("@")) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Email không hợp lệ. Vui lòng nhập đúng định dạng email.",
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Mật khẩu nhập lại không khớp.",
      });
      return;
    }

    if (!userName || !phoneNumber || !fullName || !password) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Vui lòng nhập đầy đủ thông tin.",
      });
      return;
    }

    try {
      const response = await postRequest("/auth/register", {
        email,
        userName,
        phoneNumber,
        fullName,
        gender,
        password,
      });

      if (response.status === 200) {
        Toast.show({
          type: "success",
          text1: "Đăng ký thành công",
          text2: `Mã OTP đã được gửi tới ${email}. Vui lòng kiểm tra email.`,
        });

        setTimeout(() => {
          navigation.navigate("Otp", { email });
        }, 1500);
      } else {
        Toast.show({
          type: "error",
          text1: "Lỗi đăng ký",
          text2: response.data.message || "Đăng ký thất bại, vui lòng thử lại.",
        });
      }
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.",
      });
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
          Đăng Ký Tài Khoản
        </Text>
      </View>

      <ScrollView className="p-5 rounded-lg">
        <View className="">
          <TextInputComponent
            label="Email"
            placeholder="Nhập email"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View className="">
          <TextInputComponent
            label="Tên đăng nhập"
            placeholder="Nhập tên đăng nhập"
            value={userName}
            onChangeText={setUserName}
          />
        </View>

        <View className="">
          <TextInputComponent
            label="Số điện thoại"
            placeholder="Nhập số điện thoại"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </View>

        <View className="">
          <TextInputComponent
            label="Họ và tên"
            placeholder="Nhập họ và tên"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View className="">
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

        <View className="">
          <TextInputComponent
            label="Nhập lại mật khẩu"
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <View className="">
          <Text className="text-gray-700 mb-2">Giới tính</Text>
          <View className="flex flex-row items-center">
            <CheckBox
              title="Nam"
              checked={gender === "male"}
              onPress={() => setGender("male")}
              checkedIcon="dot-circle-o"
              uncheckedIcon="circle-o"
              containerStyle={{
                backgroundColor: "transparent",
                borderWidth: 0,
              }}
            />
            <CheckBox
              title="Nữ"
              checked={gender === "female"}
              onPress={() => setGender("female")}
              checkedIcon="dot-circle-o"
              uncheckedIcon="circle-o"
              containerStyle={{
                backgroundColor: "transparent",
                borderWidth: 0,
              }}
            />
          </View>
        </View>

        <View className="flex flex-row justify-center mt-4">
          <DefaultButton
            title="Đăng ký"
            backgroundColor="black"
            onPress={handleRegister}
          />
        </View>

        <View className="flex flex-row justify-center">
          <TouchableOpacity
            className="text-blue-600 underline pt-3"
            onPress={() => navigation.goBack()}
          >
            <Text>Bạn đã có tài khoản</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
