import { View, Text, Alert } from "react-native";
import React, { useContext } from "react";
import { Button, Dialog } from "@rneui/themed";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  MaterialCommunityIcons,
  Feather,
  FontAwesome5,
} from "@expo/vector-icons";

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
  totalPrice: number;
  onClose: () => void;
  setIsLoading: (loading: boolean) => void;
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
  fullName,
  totalPrice,
  onClose,
  setIsLoading,
  fetchAppointment,
}: DialogType) {
  const { authState } = useAuth();
  const user = authState?.user;
  const navigation = useNavigation<NavigationProp>();

  const [selectedTables] = useContext(TableContext);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      if (!user) {
        onClose();
        setIsLoading(false);
        Toast.show({
          type: "error",
          text1: "Thất bại",
          text2: `Bạn cần đăng nhập để tiếp tục`,
        });
        return;
      }

      const payload = {
        fromUser: fromUserId,
        toUser: user.userId,
        tableId,
        appointmentId,
      };

      const response = await postRequest(
        "/payments/booking-request-payment",
        payload,
      );

      if (response.status === 200) {
        fetchAppointment();
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: `Đồng ý lời mời`,
        });
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
            <FontAwesome5 name="chess-board" size={18} color="#374151" />
            <Text className="ml-2 font-semibold text-base text-gray-800">
              Thông tin bàn chơi
            </Text>
          </View>
          <Text className="text-gray-700">
            <Text className="font-medium">Phòng:</Text> {roomName} ({roomType})
          </Text>
          <Text className="text-gray-700">
            <Text className="font-medium">Thời gian:</Text> {startTime} -{" "}
            {endTime}
          </Text>
        </View>

        {/* 2. Người mời */}
        <View className="space-y-1">
          <View className="flex-row items-center">
            <Feather name="user" size={18} color="#374151" />
            <Text className="ml-2 font-semibold text-base text-gray-800">
              Người mời
            </Text>
          </View>
          <Text className="text-gray-700">{fullName}</Text>
        </View>

        {/* 3. Tổng tiền */}
        <View className="bg-green-50 p-3 rounded-xl border border-green-200">
          <Text className="text-center text-base text-gray-800 font-medium">
            Tổng tiền
          </Text>
          <Text className="text-center text-xl font-bold text-green-600 mt-1">
            {totalPrice.toLocaleString("vi-VN")} VND
          </Text>
        </View>

        {/* 4. Nút hành động */}
        <View className="flex-row justify-end space-x-3 pt-1">
          <Button
            title="Hủy"
            type="outline"
            buttonStyle={{ borderColor: "#6b7280", marginRight: 10 }}
            titleStyle={{ color: "#6b7280" }}
            onPress={onClose}
          />
          <Button
            title="Đồng ý"
            buttonStyle={{ backgroundColor: "#22c55e" }}
            onPress={handleConfirm}
          />
        </View>
      </View>
    </Dialog>
  );
}
