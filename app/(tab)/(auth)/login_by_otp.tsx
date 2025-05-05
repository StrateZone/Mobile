import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
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
import BackButton from "@/components/BackButton";
import LoadingForButton from "@/components/loading/loading_button";

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

      if (response.data.message === "User doesnt exist") {
        Toast.show({
          type: "error",
          text1: "Không thể đăng nhập",
          text2: `Người dùng không tồn tại trong hệ thống.`,
        });
        return;
      }

      if (response.status === 200) {
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: `Mã OTP đã được gửi tới ${email}. Vui lòng kiểm tra email.`,
        });

        navigation.navigate("Otp", { email });
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

        <View
          style={{
            backgroundColor: "#fff",
            margin: 16,
            padding: 20,
            borderRadius: 10,
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 10,
          }}
        >
          <Text className="text-black text-4xl font-bold mb-6">Stratezone</Text>
          <Text className="text-black text-xl mb-4">Chào mừng quay lại!</Text>
          <View style={{ marginBottom: 16 }}>
            <TextInputComponent
              label="Email"
              placeholder="Nhập email"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 20,
            }}
          >
            <DefaultButton
              title={loading ? "Đang xử lý..." : "Đăng nhập"}
              backgroundColor="black"
              onPress={sendEmail}
              disabled={loading}
              icon={loading ? <LoadingForButton /> : undefined}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 20,
            }}
          >
            <TouchableOpacity
              style={{ color: "#007BFF", textDecorationLine: "underline" }}
              onPress={() => navigation.navigate("Register")}
            >
              <Text className="text-sm text-blue-600 underline">
                Bạn chưa có tài khoản?
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
