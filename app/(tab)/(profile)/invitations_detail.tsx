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
        bg: "#FEF3C7",
        text: "#B45309",
        border: "#D97706",
        display: "Chờ Phản Hồi",
        icon: <Ionicons name="time-outline" size={16} color="#b58900" />,
      };
    case "accepted":
      return {
        bg: "#DBEAFE",
        text: "#1D4ED8",
        border: "#3B82F6",
        display: "Đã Chấp Nhận Lời Mời",
        icon: (
          <Ionicons name="checkmark-circle-outline" size={16} color="#1D4ED8" />
        ),
      };
    case "rejected":
      return {
        bg: "#FECACA",
        text: "#DC2626",
        border: "#EF4444",
        display: "Đã Từ Chối Lời Mời",
        icon: (
          <Ionicons name="close-circle-outline" size={16} color="#DC2626" />
        ),
      };
    case "expired":
      return {
        bg: "#FFEDD5",
        text: "#EA580C",
        border: "#FB923C",
        display: "Lời Mời Đã Hết Hạn",
        icon: <Ionicons name="time-outline" size={16} color="#fb923c" />,
      };
    case "cancelled":
      return {
        bg: "#F3F4F6",
        text: "#6B7280",
        border: "#9CA3AF",
        display: "Lời Mời Đã Bị Hủy",
        icon: (
          <Ionicons name="close-circle-outline" size={16} color="#6B7280" />
        ),
      };
    case "accepted_by_others":
      return {
        bg: "#FCE7F3",
        text: "#BE185D",
        border: "#DB2777",
        display: "Lời Mời Đã Được Người Khác Chấp Nhận",
        icon: (
          <Ionicons name="checkmark-circle-outline" size={16} color="#DB2777" />
        ),
      };
    default:
      return {
        bg: "#E5E7EB",
        text: "#374151",
        border: "#9CA3AF",
        display: status,
        icon: <Ionicons name="ellipse-outline" size={16} color="gray" />,
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
          style={{
            position: "absolute",
            top: 8,
            left: 16,
            backgroundColor: "#D1D5DB",
            padding: 8,
            borderRadius: 999,
            zIndex: 10,
          }}
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
          style={{
            alignSelf: "center",
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 999,
            marginBottom: 20,
            borderWidth: 1,
            backgroundColor: statusInfo.bg,
            borderColor: statusInfo.border,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {statusInfo.icon}
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: statusInfo.text,
              marginLeft: 8,
            }}
          >
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
