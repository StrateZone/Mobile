import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
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
import BackButton from "@/components/BackButton";

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
            Đăng kí tài khoản
          </Text>
          <View style={{ width: 48 }} />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20 }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 8,
              padding: 16,
              elevation: 3,
            }}
          >
            <Text
              style={{
                fontSize: 28,
                fontWeight: "bold",
                color: "#212529",
                marginBottom: 16,
              }}
            >
              Chào mừng đến với Stratezone!
            </Text>
            <Text style={{ fontSize: 16, color: "#555", marginBottom: 24 }}>
              Hãy tạo tài khoản để bắt đầu trải nghiệm ngay. Chỉ cần điền thông
              tin bên dưới nhé!
            </Text>

            <View style={{ marginBottom: 12 }}>
              <TextInputComponent
                label="Email"
                placeholder="Nhập email"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={{ marginBottom: 12 }}>
              <TextInputComponent
                label="Tên đăng nhập"
                placeholder="Nhập tên đăng nhập"
                value={userName}
                onChangeText={setUserName}
              />
            </View>

            <View style={{ marginBottom: 12 }}>
              <TextInputComponent
                label="Số điện thoại"
                placeholder="Nhập số điện thoại"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
            </View>

            <View style={{ marginBottom: 12 }}>
              <TextInputComponent
                label="Họ và tên"
                placeholder="Nhập họ và tên"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={{ marginBottom: 12 }}>
              <TextInputComponent
                label="Mật khẩu"
                placeholder="Nhập mật khẩu"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry
              />
              {passwordError ? (
                <Text style={{ color: "red" }}>{passwordError}</Text>
              ) : null}
            </View>

            <View style={{ marginBottom: 12 }}>
              <TextInputComponent
                label="Nhập lại mật khẩu"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: "#333", marginBottom: 8 }}>Giới tính</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
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

            <View style={{ marginTop: 20 }}>
              <DefaultButton
                title="Đăng ký"
                backgroundColor="black"
                onPress={handleRegister}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 12,
              }}
            >
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={{ color: "#0066cc" }}>Bạn đã có tài khoản?</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
