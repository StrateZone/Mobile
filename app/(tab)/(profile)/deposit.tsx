import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";
import * as Linking from "expo-linking";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Chip } from "@rneui/themed";

import { useAuth } from "@/context/auth-context";
import { postRequest } from "@/helpers/api-requests";
import { RootStackParamList } from "@/constants/types/root-stack";

type ListTableRouteProp = RouteProp<RootStackParamList, "deposit">;

type Props = {
  route: ListTableRouteProp;
};

export default function DepositScreen({ route }: Props) {
  const navigation = useNavigation();
  const { returnUrl } = route.params;
  const { authState } = useAuth();
  const user = authState?.user;

  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const handleDeposit = async () => {
    const depositAmount = parseInt(amount);
    if (!depositAmount || depositAmount < 10000) {
      setError("Số tiền nạp tối thiểu là 10.000 VND");
      return;
    }

    setError("");

    try {
      const response = await postRequest("/zalo-pay/create-payment", {
        userId: user?.userId,
        amount: depositAmount,
        description: "Nạp tiền vào ví",
        returnUrl: returnUrl,
      });

      if (response?.data?.order_url) {
        await Linking.openURL(response.data.order_url);
        navigation.goBack();
      } else {
        setError("Không thể tạo thanh toán, vui lòng thử lại.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const suggestAmounts = [10000, 50000, 100000, 200000, 500000, 1000000];
  const dynamicSuggest = () => {
    const number = parseInt(amount);
    if (!number || number < 1) return [];
    return [1e3, 1e4, 1e5].map((multiplier) => number * multiplier);
  };

  const formatCurrency = (num: number) =>
    num.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-row items-center p-4">
        <TouchableOpacity
          className="p-2 rounded-full bg-gray-200"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-black ml-4">Nạp tiền</Text>
      </View>

      <KeyboardAvoidingView
        className="flex-1 px-6"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="flex-1 justify-center">
          <Text className="text-2xl font-bold text-black text-center mb-6">
            Nhập số tiền
          </Text>

          <View className="bg-white p-5 rounded-2xl shadow border border-gray-200">
            <TextInput
              className="w-full text-xl bg-gray-100 px-4 py-3 rounded-lg border border-gray-300"
              placeholder="VD: 100000"
              keyboardType="numeric"
              value={amount}
              onChangeText={(text) => {
                setAmount(text);
                if (parseInt(text) >= 10000) setError("");
              }}
            />
            {error ? (
              <Text className="text-red-500 mt-2 text-center">{error}</Text>
            ) : null}
          </View>

          {/* Gợi ý tùy chọn nhanh */}
          <Text className="text-md font-medium text-black mt-6 mb-2">
            Chọn nhanh:
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {suggestAmounts.map((amt) => (
              <Chip
                key={amt}
                title={formatCurrency(amt)}
                type="outline"
                onPress={() => setAmount(amt.toString())}
              />
            ))}
          </View>

          {/* Gợi ý thông minh */}
          {dynamicSuggest().length > 0 && (
            <>
              <Text className="text-md font-medium text-black mt-6 mb-2">
                Gợi ý từ số bạn nhập:
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {dynamicSuggest().map((amt) => (
                  <Chip
                    key={amt}
                    title={formatCurrency(amt)}
                    onPress={() => setAmount(amt.toString())}
                    buttonStyle={{
                      borderRadius: 16,
                      backgroundColor: "#e0f2fe",
                    }}
                    titleStyle={{ color: "#0284c7" }}
                  />
                ))}
              </View>
            </>
          )}

          <TouchableOpacity
            className="mt-10 bg-blue-600 py-4 rounded-full shadow-lg flex-row justify-center items-center"
            onPress={handleDeposit}
          >
            <Ionicons name="wallet" size={20} color="white" className="mr-2" />
            <Text className="text-white text-lg font-semibold">
              Thanh toán với ZaloPay
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
