import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Toast from "react-native-toast-message";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useAuth } from "@/context/auth-context";
import { RootStackParamList } from "../../../constants/types/root-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "@/components/BackButton";
import LoadingForButton from "@/components/loading/loading_button";

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
      setLoading(false);
    }
  };

  const resendOtp = () => {
    setTimeLeft(300);
    setIsExpired(false);
    Toast.show({
      type: "success",
      text1: "Đã gửi lại OTP!",
      text2: "Vui lòng kiểm tra email.",
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F4F5F7" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, justifyContent: "center" }}
      >
        <View
          style={{
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <BackButton customAction={() => navigation.goBack()} />
          <Text style={{ fontSize: 20, fontWeight: "600", color: "#212529" }}>
            Nhập mã OTP
          </Text>
          <View style={{ width: 48 }} />
        </View>

        <Text
          style={{
            textAlign: "center",
            marginBottom: 16,
            color: isExpired ? "red" : "gray",
          }}
        >
          {isExpired
            ? "Mã OTP đã hết hạn"
            : `OTP hết hạn sau: ${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`}
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              style={{
                width: 48,
                height: 48,
                borderWidth: 2,
                borderColor: "#ccc",
                borderRadius: 8,
                textAlign: "center",
                fontSize: 24,
                marginHorizontal: 6,
                fontWeight: "bold",
              }}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleChangeText(text, index)}
              onKeyPress={(event) => handleKeyPress(event, index)}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={resendOtp}
          style={{
            marginTop: 16,
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Text style={{ color: "#0066cc" }}>Gửi lại OTP</Text>
        </TouchableOpacity>

        <View style={{ alignItems: "center" }}>
          <TouchableOpacity
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: isExpired || loading ? "#cccccc" : "#000",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={login}
            disabled={isExpired || loading}
          >
            {loading ? (
              <LoadingForButton />
            ) : (
              <Ionicons name="arrow-forward" size={24} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
