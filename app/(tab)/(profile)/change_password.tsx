import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/auth-context";
import { config } from "@/config";
import BackButton from "@/components/BackButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/constants/types/root-stack";
import DefaultButton from "@/components/button/button";
import LoadingForButton from "@/components/loading/loading_button";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ChangePasswordScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { authState } = useAuth();
  const userId = authState?.user?.userId;

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (value: string) => {
    if (!value) return "Mật khẩu mới không được bỏ trống";
    if (value.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự";
    if (!/[A-Z]/.test(value))
      return "Mật khẩu phải chứa ít nhất 1 ký tự in hoa";
    if (!/[a-z]/.test(value))
      return "Mật khẩu phải chứa ít nhất 1 ký tự thường";
    if (!/\d/.test(value)) return "Mật khẩu phải chứa ít nhất 1 chữ số";
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value))
      return "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt";
    return "";
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    const error = validatePassword(newPassword);
    if (error) {
      setPasswordError(error);
      return;
    } else {
      setPasswordError("");
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert("Lỗi", "Xác nhận mật khẩu không khớp");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.put(
        `${config.BACKEND_API}/api/users/password/${userId}`,
        {
          oldPassword,
          newPassword,
          ConfirmPassword: confirmNewPassword,
        },
      );
      Toast.show({ type: "success", text1: "Đổi mật khẩu thành công!" });
      navigation.goBack();
    } catch (err: any) {
      console.error(err?.response?.data || err);
      Alert.alert("Lỗi", err?.response?.data?.message || "Đã có lỗi xảy ra");
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
        <View style={{ padding: 16 }}>
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            <BackButton customAction={() => navigation.goBack()} />
            <Text style={{ fontSize: 18, fontWeight: "600", color: "#212529" }}>
              Đổi mật khẩu
            </Text>
            <View style={{ width: 48 }} />
          </View>

          {/* Form */}
          <View style={{ gap: 16 }}>
            <View>
              <Text style={{ marginBottom: 6, color: "#212529" }}>
                Mật khẩu hiện tại
              </Text>
              <TextInput
                placeholder="Nhập mật khẩu hiện tại"
                secureTextEntry
                value={oldPassword}
                onChangeText={setOldPassword}
                style={{
                  borderWidth: 1,
                  borderColor: "#CED4DA",
                  borderRadius: 8,
                  padding: 12,
                  backgroundColor: "#fff",
                }}
              />
            </View>

            <View>
              <Text style={{ marginBottom: 6, color: "#212529" }}>
                Mật khẩu mới
              </Text>
              <View style={{ position: "relative" }}>
                <TextInput
                  placeholder="Nhập mật khẩu mới"
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  onBlur={() => setPasswordError(validatePassword(newPassword))}
                  style={{
                    borderWidth: 1,
                    borderColor: passwordError ? "#dc3545" : "#CED4DA",
                    borderRadius: 8,
                    padding: 12,
                    paddingRight: 40,
                    backgroundColor: "#fff",
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={{ position: "absolute", right: 10, top: 12 }}
                >
                  <Ionicons
                    name={showNewPassword ? "eye-off" : "eye"}
                    size={22}
                    color="gray"
                  />
                </TouchableOpacity>
              </View>
              {!!passwordError && (
                <Text style={{ color: "#dc3545", marginTop: 4 }}>
                  {passwordError}
                </Text>
              )}
            </View>

            <View>
              <Text style={{ marginBottom: 6, color: "#212529" }}>
                Xác nhận mật khẩu mới
              </Text>
              <View style={{ position: "relative" }}>
                <TextInput
                  placeholder="Nhập lại mật khẩu mới"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmNewPassword}
                  onChangeText={setConfirmNewPassword}
                  style={{
                    borderWidth: 1,
                    borderColor: "#CED4DA",
                    borderRadius: 8,
                    padding: 12,
                    paddingRight: 40,
                    backgroundColor: "#fff",
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: "absolute", right: 10, top: 12 }}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={22}
                    color="gray"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Button */}
            <DefaultButton
              title={loading ? "Đang xử lý..." : "Đổi mật khẩu"}
              backgroundColor="black"
              onPress={handleChangePassword}
              disabled={loading}
              icon={loading ? <LoadingForButton /> : undefined}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
