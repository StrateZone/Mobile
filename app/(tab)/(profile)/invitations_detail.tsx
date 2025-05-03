import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Avatar, Card, Button, Divider } from "@rneui/themed";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { formatDateTime } from "@/helpers/format_time";

import { RootStackParamList } from "@/constants/types/root-stack";
import { putRequest, getRequest } from "@/helpers/api-requests";
import Toast from "react-native-toast-message";
import { useAuth } from "@/context/auth-context";
import PaymentDialogForInvited from "@/components/dialog/payment_dialog_for_invited";
import ConfirmCancelTableDialog from "@/components/dialog/cancle_table_dialog";
import { Fold } from "react-native-animated-spinkit";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type InvitationsDetailRouteProp = RouteProp<
  RootStackParamList,
  "invitations_detail"
>;

type Props = {
  route: InvitationsDetailRouteProp & {
    params: {
      invitationId: number;
      avatarUrl: string;
      fullName: string;
      email: string;
      phone: string;
      tableId: number;
      roomId: number;
      roomName: string;
      roomType: string;
      startTime: string;
      endTime: string;
      createdAt: string;
      status: string;
      totalPrice: number;
      fromUserId: number;
      appointmentId: number;
    };
  };
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
        border: "border-yellow-500",
      };
    case "accepted":
      return {
        container: "bg-blue-100 border-blue-500",
        text: "text-blue-700",
        display: "Đã Chấp Nhận Lời Mời",
        iconColor: "text-blue-700",
        border: "border-blue-500",
      };
    case "rejected":
      return {
        container: "bg-red-100 border-red-500",
        text: "text-red-700",
        display: "Đã Từ Chối Lời Mời",
        iconColor: "text-red-700",
        border: "border-red-500",
      };
    case "expired":
      return {
        container: "bg-orange-100 border-orange-500",
        text: "text-orange-600",
        display: "Lời Mời Đã Hết Hạn",
        iconColor: "text-orange-600",
        border: "border-orange-500",
      };
    case "cancelled":
      return {
        container: "bg-gray-100 border-gray-400",
        text: "text-gray-600",
        display: "Lời Mời Đã Bị Hủy",
        iconColor: "text-gray-600",
        border: "border-gray-400",
      };
    case "accepted_by_others":
      return {
        container: "bg-pink-100 border-pink-500",
        text: "text-pink-700",
        display: "Lời Mời Đã Được Người Khác Chấp Nhận",
        iconColor: "text-pink-700",
        border: "border-pink-500",
      };
    case "table_cancelled":
      return {
        container: "bg-gray-100 border-gray-400",
        text: "text-gray-700",
        display: "Bàn Đã Bị Hủy",
        iconColor: "text-gray-700",
        border: "border-gray-400",
      };
    default:
      return {
        container: "bg-gray-100 border-gray-400",
        text: "text-gray-800",
        display: status,
        iconColor: "text-gray-800",
        border: "border-gray-400",
      };
  }
};

export default function InvitationsDetail({ route }: Props) {
  const { authState } = useAuth();
  const user = authState?.user;
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
    totalPrice,
    fromUserId,
    appointmentId,
    cancellingTableId,
  } = route.params;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [opneDialog, setOpenDialog] = useState(false);
  const [opneCancelAcceptTableDialog, setOpenCancelAcceptTableDialog] =
    useState(false);
  const [checkTable, setCheckTable] = useState<any>(null);
  const [isLoadingCheckTable, setIsLoadingCheckTable] =
    useState<boolean>(false);

  const startDate = formatDateTime(startTime);
  const endDate = formatDateTime(endTime);
  const statusInfo = getStatusColor(status);

  const handleReject = async () => {
    setIsLoading(true);
    try {
      await putRequest(`/appointmentrequests/reject/${invitationId}`, {});
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: `Đã từ chối lời mời`,
      });
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể từ chối lời mời",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckTable = async () => {
    setIsLoadingCheckTable(true);
    try {
      const now = new Date();
      const nowUTC7 = new Date(now.getTime() + 7 * 60 * 60 * 1000);
      const response = await getRequest(
        `/tables-appointment/cancel-check/${cancellingTableId}/users/${user?.userId}`,
        { CancelTime: nowUTC7.toISOString() },
      );
      setCheckTable(response);
      setOpenCancelAcceptTableDialog(true);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể kiểm tra điều kiện hủy bàn");
    } finally {
      setIsLoadingCheckTable(false);
    }
  };

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

          {/* Action Buttons */}
          <View className="mt-4 mb-8">
            {status === "pending" && (
              <View className="flex-row justify-center space-x-4">
                <TouchableOpacity
                  className="flex-row items-center bg-green-600 px-6 py-3 rounded-full"
                  onPress={() => {
                    if (totalPrice > (user?.wallet.balance || 0)) {
                      Alert.alert("Số dư không đủ để thanh toán!");
                    } else {
                      setOpenDialog(true);
                    }
                  }}
                >
                  <FontAwesome5 name="check" size={16} color="white" />
                  <Text className="text-white font-semibold ml-2">Đồng ý</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center bg-red-500 px-6 py-3 rounded-full"
                  onPress={handleReject}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <FontAwesome5 name="times" size={16} color="white" />
                      <Text className="text-white font-semibold ml-2">
                        Từ chối
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {status === "accepted" && (
              <View className="flex-row justify-center">
                <TouchableOpacity
                  className="flex-row items-center bg-red-500 px-6 py-3 rounded-full"
                  onPress={handleCheckTable}
                  disabled={isLoadingCheckTable}
                >
                  {isLoadingCheckTable ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Ionicons name="close-circle" size={20} color="white" />
                  )}
                  <Text className="text-white font-semibold ml-2">Hủy bàn</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>

        <PaymentDialogForInvited
          visible={opneDialog}
          fromUserId={fromUserId}
          tableId={tableId}
          appointmentId={appointmentId}
          roomName={roomName}
          roomType={roomType}
          startTime={startTime}
          endTime={endTime}
          fullName={fullName}
          onClose={() => setOpenDialog(false)}
          fetchAppointment={() => navigation.goBack()}
          totalPrice={totalPrice}
        />

        {checkTable && (
          <ConfirmCancelTableDialog
            visible={opneCancelAcceptTableDialog}
            tableId={cancellingTableId}
            data={checkTable}
            onClose={() => setOpenCancelAcceptTableDialog(false)}
            onSuccess={() => {
              navigation.goBack();
              setOpenCancelAcceptTableDialog(false);
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
