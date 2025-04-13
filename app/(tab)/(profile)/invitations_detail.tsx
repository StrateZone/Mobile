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

const statusColors: Record<string, string> = {
  pending: "#b58900",
  accepted: "green",
  rejected: "red",
  cancelled: "gray",
  expired: "purple",
  payment_required: "orange",
  await_appointment_creation: "blue",
  active: "#0ea5e9",
};

const statusTextMap: Record<string, string> = {
  pending: "Chờ xử lý",
  accepted: "Đã chấp nhận",
  rejected: "Bị từ chối",
  cancelled: "Đã hủy",
  expired: "Đã hết hạn",
  payment_required: "Cần thanh toán",
  await_appointment_creation: "Chờ tạo lịch hẹn",
  active: "Đang chờ bạn phản hồi",
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
  const statusColor = statusColors[status] || "gray";
  const statusText = statusTextMap[status] || status;

  const handleAccept = async (invitationId: number) => {
    setIsLoading(true);
    await putRequest(`/appointmentrequests/accept/${invitationId}`, {})
      .then(() => {
        setIsLoading(false);
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: `Đã đồng ý lời mời`,
        });
      })

      .catch((e) => {
        setIsLoading(false);
        console.error(e);
      });
  };

  const handleReject = async (invitationId: number) => {
    setIsLoading(true);
    await putRequest(`/appointmentrequests/reject/${invitationId}`, {})
      .then(() => {
        setIsLoading(false);
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: `Đã từ chối lời mời`,
        });
      })
      .catch((e) => {
        setIsLoading(false);
        console.error(e);
      });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-1 p-4 mt-10">
        <TouchableOpacity
          className="absolute left-4 top-2 p-2 mt-2 bg-gray-300 rounded-full z-10"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-center text-black mb-5">
          Lời mời đặt bàn
        </Text>

        <View
          className="self-center px-4 py-2 rounded-full mb-5"
          style={{
            backgroundColor: statusColor + "20",
            borderColor: statusColor,
            borderWidth: 1,
          }}
        >
          <Text
            className="text-base font-semibold text-center"
            style={{ color: statusColor }}
          >
            {statusText}
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Card
            containerStyle={{
              borderRadius: 12,
              paddingVertical: 16,
              borderColor: statusColor,
            }}
          >
            <View className="flex-row items-center mb-3">
              <FontAwesome5 name="user" size={20} color="#4B5563" />
              <Text className="text-xl font-bold text-black ml-3">
                Thông tin người gửi
              </Text>
            </View>

            <View className="items-center mb-4">
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
              <Text className="text-xl font-semibold text-black">
                {fullName}
              </Text>
            </View>

            <Divider />

            <View className="flex-row items-center mt-4">
              <Ionicons name="mail" size={20} color="#4B5563" />
              <Text className="text-base text-gray-700 ml-3">{email}</Text>
            </View>

            <View className="flex-row items-center mt-3">
              <Ionicons name="call" size={20} color="#4B5563" />
              <Text className="text-base text-gray-700 ml-3">{phone}</Text>
            </View>
          </Card>

          <Card
            containerStyle={{
              borderRadius: 12,
              paddingVertical: 16,
              borderColor: statusColor,
            }}
          >
            <View className="flex-row items-center mb-3">
              <FontAwesome5 name="chess-board" size={20} color="#4B5563" />
              <Text className="text-xl font-bold text-black ml-3">
                Thông tin bàn cờ
              </Text>
            </View>
            <Text className="text-base text-gray-700 mb-1">Bàn: {tableId}</Text>
            <Text className="text-base text-gray-700 mb-1">
              Phòng: {roomId} - {roomName}
            </Text>
            <Text className="text-base text-gray-700">
              Loại phòng: {roomType}
            </Text>
          </Card>

          <Card
            containerStyle={{
              borderRadius: 12,
              paddingVertical: 16,
              borderColor: statusColor,
            }}
          >
            <View className="flex-row items-center mb-3">
              <Ionicons name="time-outline" size={20} color="#4B5563" />
              <Text className="text-xl font-bold text-black ml-3">
                Thời gian
              </Text>
            </View>
            <Text className="text-base text-gray-700 mb-1">
              Ngày chơi: {startDate.date}
            </Text>
            <Text className="text-base text-gray-700">
              Giờ chơi: {startDate.time} - {endDate.time}
            </Text>
          </Card>
        </ScrollView>
        {/* {status === "pending" && (
            <View className="flex-row justify-around mt-6">
              <Button
                title="Từ chối"
                buttonStyle={{ backgroundColor: "#dc2626", paddingHorizontal: 24 }}
                icon={<Ionicons name="close-circle" size={20} color="white" />}
                onPress={() => handleReject(invitationId)}
              />
              <Button
                title="Đồng ý"
                buttonStyle={{ backgroundColor: "#16a34a", paddingHorizontal: 24 }}
                icon={<Ionicons name="checkmark-circle" size={20} color="white" />}
              
                onPress={() => handleAccept(invitationId)}
              />
            </View>
          )} */}
      </View>
    </SafeAreaView>
  );
}
