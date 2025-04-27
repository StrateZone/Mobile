import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Avatar, Card, Badge } from "@rneui/themed";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/constants/types/root-stack";
import { getRequest } from "@/helpers/api-requests";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ListTableRouteProp = RouteProp<RootStackParamList, "friend_detail">;
type Props = { route: ListTableRouteProp };

export default function FriendDetail({ route }: Props) {
  const navigation = useNavigation<NavigationProp>();
  const { friendId } = route.params;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [friend, setFriend] = useState<any>(null);

  const loadFriendData = async () => {
    setIsLoading(true);
    try {
      const response = await getRequest(`/users/${friendId}`);
      setFriend(response);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFriendData();
  }, []);

  if (!friend) return null;

  const isMember = friend?.userRole === "Member";

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="relative">
        <TouchableOpacity
          className="absolute left-4 top-2 p-2 bg-gray-300 rounded-full z-10"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="items-center mt-16">
          <Avatar
            size={120}
            rounded
            source={{ uri: friend.avatarUrl }}
            containerStyle={{
              borderWidth: 4,
              borderColor: isMember ? "#d8b4fe" : "#e5e7eb", // border tím nhẹ nếu Member
            }}
          />
          <Text className="text-xl font-bold text-black mt-4">
            {friend.fullName}
          </Text>

          {isMember && (
            <Badge
              value="Member"
              badgeStyle={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: "transparent",
                borderRadius: 20,
              }}
              textStyle={{
                fontWeight: "bold",
                color: "white",
              }}
              containerStyle={{ marginTop: 8 }}
            >
              <View className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-1 rounded-full">
                <Text className="text-white font-bold">Member</Text>
              </View>
            </Badge>
          )}
        </View>

        <Card containerStyle={{ marginTop: 20, borderRadius: 12 }}>
          <Card.Title className="text-lg font-semibold text-black">
            Thông tin cá nhân
          </Card.Title>
          <Card.Divider />

          <View className="space-y-4">
            <InfoRow label="Tên đăng nhập" value={friend.username} />
            <InfoRow label="Email" value={friend.email} />
            <InfoRow
              label="Địa chỉ"
              value={friend.address || "Chưa cập nhật"}
            />
            <InfoRow
              label="Giới tính"
              value={friend.gender === "male" ? "Nam" : "Nữ"}
            />
            <InfoRow
              label="Ngày tham gia"
              value={new Date(friend.createdAt).toLocaleTimeString()}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

// Component nhỏ để tái sử dụng cho từng dòng thông tin
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between items-center">
      <Text className="text-gray-600 font-medium">{label}</Text>
      <Text className="text-gray-800">{value}</Text>
    </View>
  );
}
