import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import {
  MaterialIcons,
  FontAwesome5,
  Ionicons,
  AntDesign,
} from "@expo/vector-icons";
import { useAuth } from "@/context/auth-context";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/constants/types/root-stack";
import * as Linking from "expo-linking";
import axios from "axios";
import { config } from "@/config";
import { LinearGradient } from "expo-linear-gradient";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const OptionItem = ({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center justify-between p-4 bg-white rounded-xl shadow-md mb-3"
  >
    <View className="flex-row items-center space-x-3">
      {icon}
      <Text className="text-base text-black font-medium">{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={22} color="#9CA3AF" />
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const { authState, onUpdateUserBalance } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const returnUrl = Linking.createURL("profile");

  const user = authState?.user;
  const [refreshing, setRefreshing] = useState(false);
  const [userLabel, setUserLabel] = useState<string | null>(null);

  const fetchBalance = async () => {
    setRefreshing(true);
    if (onUpdateUserBalance) await onUpdateUserBalance();
    setRefreshing(false);
  };

  useEffect(() => {
    const fetchUserLabel = async () => {
      if (!user?.userId) return;
      try {
        const res = await axios.get(
          `${config.BACKEND_API}/api/users/${user.userId}`,
        );
        setUserLabel(res.data?.userLabel || null);
      } catch (err) {
        console.error("Failed to fetch user label", err);
      }
    };

    fetchUserLabel();
  }, [user?.userId]);

  const genderText = user?.gender === "male" ? "Nam" : "Nữ";

  return (
    <ScrollView
      className="flex-1 bg-gray-100"
      contentContainerStyle={{ padding: 20 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchBalance} />
      }
      keyboardShouldPersistTaps="handled"
    >
      {/* Avatar + Name + Balance */}
      <View className="items-center bg-white p-5 rounded-2xl shadow-md mb-5">
        <Image
          source={{
            uri:
              user?.imageUrl ||
              "https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg",
          }}
          className={`w-28 h-28 rounded-full border-4 ${
            userLabel === "top_contributor"
              ? "border-yellow-400"
              : "border-white"
          } shadow`}
        />

        {userLabel === "top_contributor" && (
          <View className="flex-row items-center mt-1 px-3 py-1 bg-yellow-500 rounded-full shadow-sm">
            <Ionicons name="trophy" size={16} color="white" />
            <Text className="text-white font-semibold text-sm ml-2">
              Top Contributor
            </Text>
          </View>
        )}
        <Text className="text-xl font-semibold mt-4 text-gray-900">
          {user?.fullName || "Họ và tên"}
        </Text>
        <Text className="text-gray-500 mt-1">
          Số dư:{" "}
          <Text className="font-semibold text-black">
            {user?.wallet?.balance?.toLocaleString("vi-VN") || "0"} VND
          </Text>
        </Text>
        <TouchableOpacity
          className="mt-4 bg-green-500 px-6 py-2.5 rounded-full"
          onPress={() => navigation.navigate("deposit", { returnUrl })}
        >
          <Text className="text-white font-medium text-base">Nạp ví</Text>
        </TouchableOpacity>
      </View>

      {/* Thông tin cá nhân */}
      <View className="bg-white p-5 rounded-2xl shadow-md mb-6">
        <Text className="text-lg font-bold text-gray-800 mb-4">
          Thông tin cá nhân
        </Text>

        <View className="mb-3">
          <View className="flex-row items-center space-x-2 mb-1">
            <MaterialIcons name="email" size={20} color="#6B7280" />
            <Text className="text-gray-600 font-medium">Email</Text>
          </View>
          <Text className="text-gray-800">
            {user?.email || "email@gmail.com"}
          </Text>
        </View>

        <View className="mb-3">
          <View className="flex-row items-center space-x-2 mb-1">
            <FontAwesome5 name="phone" size={18} color="#6B7280" />
            <Text className="text-gray-600 font-medium">Số điện thoại</Text>
          </View>
          <Text className="text-gray-800">{user?.phone || "0123456789"}</Text>
        </View>

        <View>
          <View className="flex-row items-center space-x-2 mb-1">
            <Ionicons name="male-female" size={20} color="#6B7280" />
            <Text className="text-gray-600 font-medium">Giới tính</Text>
          </View>
          <Text className="text-gray-800">{genderText}</Text>
        </View>
      </View>

      {/* Các tuỳ chọn điều hướng */}
      <OptionItem
        label="Đổi mật khẩu"
        icon={<AntDesign name="lock" size={20} color="#4B5563" />}
        onPress={() => navigation.navigate("change_password")}
      />
      <OptionItem
        label="Lời mời đặt hẹn"
        icon={<Ionicons name="mail-outline" size={20} color="#4B5563" />}
        onPress={() => navigation.navigate("invitations")}
      />
      <OptionItem
        label="Cuộc hẹn đang chờ"
        icon={<Ionicons name="time-outline" size={20} color="#4B5563" />}
        onPress={() => navigation.navigate("appointment_ongoing")}
      />
      <OptionItem
        label="Lịch sử đặt hẹn"
        icon={<Ionicons name="calendar-outline" size={20} color="#4B5563" />}
        onPress={() => navigation.navigate("appointment_history")}
      />
      <OptionItem
        label="Biến động số dư"
        icon={<Ionicons name="trending-up-outline" size={20} color="#4B5563" />}
        onPress={() => navigation.navigate("balance_movement_history")}
      />
    </ScrollView>
  );
}
