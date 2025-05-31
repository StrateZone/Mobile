import { View, Text, Alert } from "react-native";
import React, { useContext, useState } from "react";
import { Button, Dialog } from "@rneui/themed";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  MaterialCommunityIcons,
  Feather,
  FontAwesome5,
} from "@expo/vector-icons";
import { Fold } from "react-native-animated-spinkit";

import { TableContext } from "@/context/select-table";
import { useAuth } from "@/context/auth-context";
import { postRequest } from "@/helpers/api-requests";
import { RootStackParamList } from "@/constants/types/root-stack";
import Toast from "react-native-toast-message";

export type DialogType = {
  visible: boolean;
  fromUserId: number;
  tableId: number;
  appointmentId: number;
  roomName: string;
  roomType: string;
  startTime: string;
  endTime: string;
  fullName: string;
  tableAppointmentId: number;
  totalPrice?: number;
  isPaid?: boolean;
  onClose: () => void;
  fetchAppointment: () => void;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PaymentDialogForInvited({
  visible,
  fromUserId,
  tableId,
  appointmentId,
  roomName,
  roomType,
  startTime,
  endTime,
  tableAppointmentId,
  fullName,
  totalPrice,
  isPaid,
  onClose,
  fetchAppointment,
}: DialogType) {
  const { authState } = useAuth();
  const user = authState?.user;
  const navigation = useNavigation<NavigationProp>();
  const [selectedTables] = useContext(TableContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      if (!user) {
        onClose();
        setIsLoading(true);
        Toast.show({
          type: "error",
          text1: "Thất bại",
          text2: `Bạn cần đăng nhập để tiếp tục`,
        });
        return;
      }

      if (totalPrice > user!.wallet.balance) {
        onClose();
        Alert.alert("Số dư không đủ để thanh toán!");
      }

      const payload = {
        fromUser: fromUserId,
        toUser: user.userId,
        tableAppointmentId,
      };

      const response = await postRequest(
        "/payments/booking-request-payment",
        payload,
      );

      if (response.data.message) {
        if (
          response.data.message ===
          "This appointment invitation is no longer available."
        ) {
          Toast.show({
            type: "error",
            text1: "Không thể đồng ý lời mời",
            text2: "Bàn này gần tới giờ chơi nên bạn không thể đồng ý lời mời.",
          });
          return;
        }
        if (response.data.message === "Payment success" || "Request accepted") {
          fetchAppointment();
          Toast.show({
            type: "success",
            text1: "Thành công",
            text2: `Đồng ý lời mời`,
          });
        }
      }
    } catch (error) {
      Alert.alert("Lỗi đặt bàn", "Đã có lỗi xảy ra", [
        {
          text: "Không thể đồng ý bàn này",
          onPress: () => {
            navigation.goBack();
          },
          style: "cancel",
        },
      ]);
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <Dialog isVisible={visible} onBackdropPress={onClose}>
      <Dialog.Title title="Xác nhận tham gia bàn chơi" />

      <View className="space-y-4 px-2 pb-3 pt-1">
        {/* 1. Thông tin bàn chơi */}
        <View className="space-y-1">
          <View className="flex-row items-center">
            <FontAwesome5 name="chess-board" size={23} color="#374151" />
            <Text className="ml-2 font-semibold text-md text-gray-800">
              Thông tin bàn chơi
            </Text>
          </View>
          <Text className="text-gray-700">
            <Text className="font-medium">Phòng:</Text> {roomName}
          </Text>

          <Text className="text-gray-700">
            <Text className="font-medium">Loại phòng:</Text>{" "}
            {{
              basic: "Thường",
              openspaced: "Không gian mở",
              premium: "Cao cấp",
            }[roomType] || roomType}
          </Text>

          <Text className="text-gray-700">
            <Text className="font-medium">Thời gian:</Text> {startTime} -{" "}
            {endTime}
          </Text>
        </View>

        {/* 2. Người mời */}
        <View className="space-y-1">
          <View className="flex-row items-center">
            <Feather name="user" size={23} color="#374151" />
            <Text className="ml-2 font-semibold text-md text-gray-800">
              Người mời
            </Text>
          </View>
          <Text className="text-gray-700">{fullName}</Text>
        </View>

        {/* 3. Tổng tiền hoặc thông báo đã thanh toán */}
        {isPaid ? (
          <View className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
            <View className="flex-row items-center justify-center">
              <FontAwesome5 name="check-circle" size={20} color="#10b981" />
              <Text className="text-center text-base text-emerald-600 font-medium ml-2">
                Lời mời này đã được người gửi thanh toán
              </Text>
            </View>
          </View>
        ) : (
          <View className="bg-green-50 p-3 rounded-xl border border-green-200">
            <Text className="text-center text-base text-gray-800 font-medium">
              Tổng tiền
            </Text>
            <Text className="text-center text-xl font-bold text-green-600 mt-1">
              {totalPrice?.toLocaleString("vi-VN")} VND
            </Text>
          </View>
        )}

        {/* 4. Nút hành động */}
        <View className="flex-row justify-end space-x-3 pt-1">
          <Button
            title="Đóng"
            type="outline"
            onPress={onClose}
            buttonStyle={{
              borderColor: "#6b7280",
              paddingVertical: 10,
              paddingHorizontal: 16,
              minWidth: 100,
            }}
            titleStyle={{ color: "#6b7280", fontSize: 14 }}
            disabled={isLoading}
          />
          <Button
            title={
              isLoading ? (
                <View className="flex-row items-center justify-center gap-2">
                  <Fold size={16} color="black" />
                  <Text className="text-black text-sm">Đang xử lý</Text>
                </View>
              ) : (
                "Đồng ý"
              )
            }
            onPress={handleConfirm}
            buttonStyle={{
              backgroundColor: "#22c55e",
              paddingVertical: 10,
              paddingHorizontal: 16,
              minWidth: 120,
            }}
            titleStyle={{ fontSize: 14 }}
            disabled={isLoading}
          />
        </View>
      </View>
    </Dialog>
  );
}
