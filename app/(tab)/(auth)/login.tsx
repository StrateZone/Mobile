import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import TextInputComponent from "@/components/input";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import DefaultButton from "@/components/button/button";
import { RootStackParamList } from "../../../constants/types/root-stack";
import { useAuth } from "@/context/auth-context";
import { Fold } from "react-native-animated-spinkit";
import LoadingForButton from "@/components/loading/loading_button";

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { onLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePassword = (password: string): string | null => {
    if (!password) return "Mật khẩu không được để trống.";
    if (password.length < 8) return "Mật khẩu phải có ít nhất 8 kí tự.";
    if (!/[A-Z]/.test(password))
      return "Mật khẩu phải chứa ít nhất một chữ in hoa.";
    if (!/[a-z]/.test(password))
      return "Mật khẩu phải chứa ít nhất một chữ in thường.";
    if (!/\d/.test(password)) return "Mật khẩu phải chứa ít nhất một chữ số.";
    if (!/[^A-Za-z0-9]/.test(password))
      return "Mật khẩu phải chứa ít nhất một kí tự đặc biệt.";
    return null;
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    const error = validatePassword(text);
    setPasswordError(error || "");
  };

  const handleLogin = async () => {
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
      const result = await onLogin?.(email, password);
      if (result?.success) {
        Toast.show({ type: "success", text1: "Đăng nhập thành công!" });
        navigation.navigate("Profile", { screen: "profile" });
      } else {
        Toast.show({
          type: "error",
          text1: "Lỗi đăng nhập",
          text2: result?.data?.msg || "Sai tên đăng nhập hoặc mật khẩu",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Lỗi hệ thống",
        text2: "Vui lòng thử lại sau.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 p-4">
      <View className="flex-1 justify-center items-center">
        <View className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <Text className="text-black text-4xl font-bold mb-6">Stratezone</Text>

          <Text className="text-black text-xl mb-4">Chào mừng quay lại!</Text>

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
              secureTextEntry={!showPassword}
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={22}
                    color="gray"
                  />
                </TouchableOpacity>
              }
            />
            {passwordError ? (
              <Text className="text-red-500">{passwordError}</Text>
            ) : null}
          </View>

          <View className="flex flex-row justify-center mt-4">
            <DefaultButton
              title={loading ? "Đang xử lý..." : "Đăng nhập"}
              backgroundColor="black"
              onPress={handleLogin}
              disabled={loading}
              icon={loading ? <LoadingForButton /> : undefined}
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

          <View className="flex flex-row justify-center">
            <TouchableOpacity
              className="text-blue-600 underline pt-2"
              onPress={() => navigation.navigate("LoginByOtp")}
            >
              <Text>Đăng nhập bằng mã OTP</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
