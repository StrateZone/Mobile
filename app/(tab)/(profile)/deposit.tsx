import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from "react-native";
import * as Linking from "expo-linking";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

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

      <View className="flex-1 justify-center px-6">
        <Text className="text-2xl font-bold text-black text-center mb-6">
          Nhập số tiền
        </Text>

        <View className="bg-white p-5 rounded-xl shadow-lg border border-gray-200">
          <TextInput
            className="w-full text-lg bg-gray-100 px-4 py-3 rounded-lg border border-gray-300"
            placeholder="Tối thiểu 10,000 VND"
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

        <TouchableOpacity
          className="mt-6 bg-blue-500 py-3 rounded-full shadow-md flex-row justify-center items-center"
          onPress={handleDeposit}
        >
          <Ionicons name="wallet" size={20} color="white" className="mr-2" />
          <Text className="text-white text-lg font-semibold">
            Thanh toán với ZaloPay
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
