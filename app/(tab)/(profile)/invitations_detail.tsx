import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Avatar, Card, Button, Divider } from "@rneui/themed";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { formatDateTime } from "@/helpers/format_time";

import { RootStackParamList } from "@/constants/types/root-stack";
import { putRequest } from "@/helpers/api-requests";
import Toast from "react-native-toast-message";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type InvitationsDetailRouteProp = RouteProp<
  RootStackParamList,
  "invitations_detail"
>;

type Props = {
  route: InvitationsDetailRouteProp;
};

const getStatusColor = (status: string) => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case "pending":
      return {
        container: "bg-yellow-100 border-yellow-500",
        text: "text-yellow-700",
        display: "Chờ Phản Hồi",
        iconColor: "text-yellow-700",
      };
    case "accepted":
      return {
        container: "bg-blue-100 border-blue-500",
        text: "text-blue-700",
        display: "Đã Chấp Nhận Lời Mời",
        iconColor: "text-blue-700",
      };
    case "rejected":
      return {
        container: "bg-red-100 border-red-500",
        text: "text-red-700",
        display: "Đã Từ Chối Lời Mời",
        iconColor: "text-red-700",
      };
    case "expired":
      return {
        container: "bg-orange-100 border-orange-500",
        text: "text-orange-600",
        display: "Lời Mời Đã Hết Hạn",
        iconColor: "text-orange-600",
      };
    case "cancelled":
      return {
        container: "bg-gray-100 border-gray-400",
        text: "text-gray-600",
        display: "Lời Mời Đã Bị Hủy",
        iconColor: "text-gray-600",
      };
    case "accepted_by_others":
      return {
        container: "bg-pink-100 border-pink-500",
        text: "text-pink-700",
        display: "Lời Mời Đã Được Người Khác Chấp Nhận",
        iconColor: "text-pink-700",
      };
    case "table_cancelled":
      return {
        container: "bg-gray-100 border-gray-400",
        text: "text-gray-700",
        display: "Bàn Đã Bị Hủy",
        iconColor: "text-gray-700",
      };
    default:
      return {
        container: "bg-gray-100 border-gray-400",
        text: "text-gray-800",
        display: status,
        iconColor: "text-gray-800",
      };
  }
};

export default function InvitationsDetail({ route }: Props) {
  const navigation = useNavigation<NavigationProp>();
  const {
    invitationId,
    avatarUrl,
    fullName,
    email,
    phone,
    tableId,
    roomId,
    roomName,
    roomType,
    startTime,
    endTime,
    createdAt,
    status,
  } = route.params;

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const startDate = formatDateTime(startTime);
  const endDate = formatDateTime(endTime);
  const statusInfo = getStatusColor(status);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
      <View style={{ flex: 1, padding: 16, marginTop: 40 }}>
        <TouchableOpacity
          className="absolute top-2 left-4 bg-gray-300 p-2 rounded-full z-10"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            textAlign: "center",
            color: "black",
            marginBottom: 20,
          }}
        >
          Lời mời đặt hẹn
        </Text>

        <View
          className={`self-center px-4 py-2 rounded-full mb-5 border flex-row items-center justify-center ${statusInfo.container}`}
        >
          <Ionicons
            name="time-outline"
            size={16}
            className={`mr-1 ${statusInfo.iconColor}`}
          />
          <Text className={`text-base font-semibold ml-2 ${statusInfo.text}`}>
            {statusInfo.display}
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          {/* Card 1: Sender Info */}
          <Card
            containerStyle={{
              borderRadius: 12,
              paddingVertical: 16,
              borderColor: statusInfo.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <FontAwesome5 name="user" size={20} color="#4B5563" />
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "#000",
                  marginLeft: 12,
                }}
              >
                Thông tin người gửi
              </Text>
            </View>

            <View style={{ alignItems: "center", marginBottom: 16 }}>
              <Avatar
                rounded
                size={100}
                source={{
                  uri:
                    avatarUrl ||
                    "https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg",
                }}
                containerStyle={{ marginBottom: 12 }}
              />
              <Text style={{ fontSize: 18, fontWeight: "600", color: "black" }}>
                {fullName}
              </Text>
            </View>

            <Divider />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 16,
              }}
            >
              <Ionicons name="mail" size={20} color="#4B5563" />
              <Text style={{ fontSize: 16, color: "#374151", marginLeft: 12 }}>
                {email}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 12,
              }}
            >
              <Ionicons name="call" size={20} color="#4B5563" />
              <Text style={{ fontSize: 16, color: "#374151", marginLeft: 12 }}>
                {phone}
              </Text>
            </View>
          </Card>

          {/* Card 2: Table Info */}
          <Card
            containerStyle={{
              borderRadius: 12,
              paddingVertical: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <FontAwesome5 name="chess-board" size={20} color="#4B5563" />
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "#000",
                  marginLeft: 12,
                }}
              >
                Thông tin bàn cờ
              </Text>
            </View>
            <Text style={{ fontSize: 16, color: "#374151", marginBottom: 4 }}>
              Bàn: {tableId}
            </Text>
            <Text style={{ fontSize: 16, color: "#374151", marginBottom: 4 }}>
              Phòng: {roomId} - {roomName}
            </Text>
            <Text style={{ fontSize: 16, color: "#374151" }}>
              Loại phòng:{" "}
              {{
                basic: "Thường",
                openspaced: "Không gian mở",
                premium: "Cao cấp",
              }[roomType] || roomType}
            </Text>
          </Card>

          {/* Card 3: Time Info */}
          <Card
            containerStyle={{
              borderRadius: 12,
              paddingVertical: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Ionicons name="time-outline" size={20} color="#4B5563" />
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "#000",
                  marginLeft: 12,
                }}
              >
                Thời gian
              </Text>
            </View>
            <Text style={{ fontSize: 16, color: "#374151", marginBottom: 4 }}>
              Ngày chơi: {startDate.date}
            </Text>
            <Text style={{ fontSize: 16, color: "#374151" }}>
              Giờ chơi: {startDate.time} - {endDate.time}
            </Text>
          </Card>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
