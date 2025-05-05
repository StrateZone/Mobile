import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import axios from "axios";
import { config } from "@/config";
import Toast from "react-native-toast-message";
import { RootStackParamList } from "@/constants/types/root-stack";
import Entypo from "@expo/vector-icons/Entypo";
import BackButton from "@/components/BackButton";
import { SafeAreaView } from "react-native-safe-area-context";

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ForgotPassword() {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

  const handleSendOtp = async () => {
    if (!email.includes("@")) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Email không hợp lệ. Vui lòng nhập đúng định dạng email.",
      });
      return;
    }

    if (!emailError && email) {
      setLoading(true);

      try {
        const response = await axios.post(
          `${config.BACKEND_API}/api/auth/recover-password?email=${encodeURIComponent(email)}`,
        );

        if (
          response.data?.success === false ||
          response.data?.statusCode === 404
        ) {
          Toast.show({
            type: "error",
            text1: "Email không tồn tại",
            text2: "Vui lòng kiểm tra lại địa chỉ email.",
          });
          return;
        }

        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: "Yêu cầu khôi phục mật khẩu đã được gửi đến email.",
        });

        navigation.navigate("login");
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Lỗi hệ thống",
          text2: "Không thể gửi yêu cầu. Vui lòng thử lại sau.",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F4F5F7" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View
          style={{
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <BackButton customAction={() => navigation.goBack()} />
          <Text style={{ fontSize: 20, fontWeight: "600", color: "#212529" }}>
            Đăng nhập otp
          </Text>
          <View style={{ width: 48 }} />
        </View>
        <View className="bg-gray-100 rounded-xl p-6 shadow-lg">
          <Text className="text-black text-4xl font-bold mb-6">Stratezone</Text>

          <Text className="text-black text-xl mb-4">
            Vui lòng nhập email, chúng tôi sẽ gửi mật khẩu mới đến bạn
          </Text>

          <View className="mb-4">
            <View className="flex-row items-center border-b border-gray-300">
              <Entypo name="mail" size={20} color="#6B7280" />
              <TextInput
                placeholder="Email"
                className="flex-1 ml-2 text-gray-900 py-2"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                }}
                //   onBlur={() => validateEmail(email)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {emailError ? (
              <Text className="text-red-500 text-xs mt-1">{emailError}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            className={`w-full py-3 rounded-lg ${loading || !email ? "bg-gray-400" : "bg-black"}`}
            onPress={handleSendOtp}
            disabled={loading || !!emailError || !email}
          >
            {loading ? (
              <View className="flex-row justify-center items-center">
                <ActivityIndicator color="#fff" />
                <Text className="text-white ml-2">Đang gửi yêu cầu...</Text>
              </View>
            ) : (
              <Text className="text-white text-center font-bold">
                Gửi Yêu Cầu
              </Text>
            )}
          </TouchableOpacity>

          <View className="mt-6 items-center">
            <Text className="text-gray-600">
              Đã nhớ mật khẩu?{" "}
              <Text
                className="text-blue-500 underline"
                onPress={() => navigation.navigate("login")}
              >
                Quay lại Đăng Nhập
              </Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
