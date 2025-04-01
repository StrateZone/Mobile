import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList } from "@/constants/types/root-stack";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PaymentSuccessScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View className="flex-1 items-center justify-center bg-gray-100 p-6">
      <View className="bg-green-500 p-6 rounded-full">
        <Ionicons name="card" size={50} color="white" />
        <Ionicons
          name="checkmark-circle"
          size={30}
          color="black"
          style={{ position: "absolute", bottom: -5, right: -5 }}
        />
      </View>

      <Text className="text-2xl font-bold text-green-600 mt-6">
        Thanh toán thành công
      </Text>
      <Text className="text-gray-700 text-lg mt-2">
        Cảm ơn đã sử dụng dịch vụ của chúng tôi!
      </Text>
      <Text className="text-gray-500 text-center mt-2">
        Bạn có thể quay lại tiếp tục đặt bàn bằng hoặc xem lịch sử đặt bàn
      </Text>

      <TouchableOpacity
        className="bg-green-500 px-6 py-3 rounded-full mt-6"
        onPress={() => navigation.navigate("home_booking")}
      >
        <Text className="text-white text-lg font-semibold">
          Tiếp tục đặt bàn
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="bg-green-500 px-6 py-3 rounded-full mt-6"
        onPress={() => navigation.navigate("home_booking")}
      >
        <Text className="text-white text-lg font-semibold">
          Lịch sử đặt bàn
        </Text>
      </TouchableOpacity>
    </View>
  );
}
