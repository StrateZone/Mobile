import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useAuth } from "@/context/auth-context";
import { MaterialIcons, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Linking from "expo-linking";
import { useCallback, useState } from "react";

import { RootStackParamList } from "@/constants/types/root-stack";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const returnUrl = Linking.createURL("profile");
  const { authState, onUpdateUserBalance } = useAuth();
  const user = authState?.user;
  const navigation = useNavigation<NavigationProp>();

  const [refreshing, setRefreshing] = useState(false);

  const fetchBalance = async () => {
    setRefreshing(true);
    if (onUpdateUserBalance) {
      await onUpdateUserBalance();
    }
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchBalance();
    }, []),
  );

  return (
    <ScrollView
      className="flex-1 bg-gray-100"
      contentContainerStyle={{ flexGrow: 1, padding: 24 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchBalance} />
      }
      keyboardShouldPersistTaps="handled"
    >
      <View className="items-center mb-6 bg-white p-5 rounded-xl shadow-md">
        <Image
          source={{
            uri: "https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg",
          }}
          className="w-24 h-24 rounded-full border-4 border-white shadow-md"
        />
        <Text className="text-2xl font-semibold mt-3 text-gray-900">
          {user?.fullName || "Họ và tên"}
        </Text>
        <Text className="text-gray-500 text-sm mt-1">
          Số dư:{" "}
          <Text className="font-semibold text-black">
            {user?.wallet?.balance.toLocaleString("vi-VN") || "0"} VND
          </Text>
        </Text>
        <TouchableOpacity
          className="bg-green-500 px-6 py-3 rounded-full mt-4"
          onPress={() => navigation.navigate("deposit", { returnUrl })}
        >
          <Text className="text-white text-lg font-semibold">Nạp tiền</Text>
        </TouchableOpacity>
      </View>

      {/* Thông tin cá nhân */}
      <View className="bg-white p-5 rounded-xl shadow-md space-y-4">
        <Text className="text-black text-xl font-bold">Thông tin cá nhân</Text>

        <View className="flex-row items-center">
          <MaterialIcons name="email" size={20} color="#4B5563" />
          <Text className="text-gray-600 text-lg font-medium ml-2">Email</Text>
        </View>
        <Text className="text-gray-800 text-base">
          {user?.email || "email@gmail.com"}
        </Text>

        <View className="flex-row items-center">
          <FontAwesome5 name="phone" size={20} color="#4B5563" />
          <Text className="text-gray-600 text-lg font-medium ml-2">
            Số điện thoại
          </Text>
        </View>
        <Text className="text-gray-800 text-base">
          {user?.phone || "0123456789"}
        </Text>

        <View className="flex-row items-center">
          <Ionicons name="male-female" size={20} color="#4B5563" />
          <Text className="text-gray-600 text-lg font-medium ml-2">
            Giới tính
          </Text>
        </View>
        <Text className="text-gray-800 text-base">
          {user?.gender === "male" ? "Nam" : "Nữ"}
        </Text>

        {/* <View className="flex-row items-center">
          <FontAwesome5 name="medal" size={20} color="#4B5563" />
          <Text className="text-gray-600 text-lg font-medium ml-2">
            Cấp bậc
          </Text>
        </View> */}
        {/* <Text className="text-gray-800 text-base">
          {user?.ranking || "Chưa có xếp hạng"}
        </Text> */}

        {/* <View className="flex-row items-center">
          <MaterialIcons name="school" size={20} color="#4B5563" />
          <Text className="text-gray-600 text-lg font-medium ml-2">
            Trình độ
          </Text>
        </View> */}
        {/* <Text className="text-gray-800 text-base">
          {user?.skillLevel || "Chưa xác định"}
        </Text> */}
      </View>

      {/* Các tùy chọn khác */}
      <TouchableOpacity
        className="bg-white p-5 rounded-xl shadow-md flex-row justify-between items-center mt-6"
        onPress={() => navigation.navigate("invitations")}
      >
        <Text className="text-black text-lg font-semibold">
          Lời mời đặt hẹn
        </Text>
        <Ionicons name="chevron-forward" size={24} color="black" />
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-white p-5 rounded-xl shadow-md flex-row justify-between items-center mt-6"
        onPress={() => navigation.navigate("appointment_ongoing")}
      >
        <Text className="text-black text-lg font-semibold">
          Cuộc hẹn đang chờ
        </Text>
        <Ionicons name="chevron-forward" size={24} color="black" />
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-white p-5 rounded-xl shadow-md flex-row justify-between items-center mt-6"
        onPress={() => navigation.navigate("appointment_history")}
      >
        <Text className="text-black text-lg font-semibold">
          Lịch sử đặt hẹn
        </Text>
        <Ionicons name="chevron-forward" size={24} color="black" />
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-white p-5 rounded-xl shadow-md flex-row justify-between items-center mt-6"
        onPress={() => navigation.navigate("balance_movement_history")}
      >
        <Text className="text-black text-lg font-semibold">
          Biến động số dư
        </Text>
        <Ionicons name="chevron-forward" size={24} color="black" />
      </TouchableOpacity>
    </ScrollView>
  );
}
