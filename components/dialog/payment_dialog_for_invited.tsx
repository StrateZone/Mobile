import { View, Text, Alert } from "react-native";
import React, { useContext } from "react";
import { Button, Dialog } from "@rneui/themed";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { TableContext } from "@/context/select-table";
import { ChessTable } from "@/constants/types/chess_table";
import { useAuth } from "@/context/auth-context";
import { postRequest } from "@/helpers/api-requests";
import { RootStackParamList } from "@/constants/types/root-stack";

export type DialogType = {
  visible: boolean;
  roomName: string;
  roomType: string;
  startTime: string;
  endTime: string;
  fullName: string;
  totalPrice: number;
  onClose: () => void;
  setIsLoading: (loading: boolean) => void;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PaymentDialogForInvited({
  visible,
  roomName,
  roomType,
  startTime,
  endTime,
  fullName,
  totalPrice,
  onClose,
  setIsLoading,
}: DialogType) {
  const { authState } = useAuth();
  const user = authState?.user;
  const navigation = useNavigation<NavigationProp>();
  console.log(totalPrice);
  const [selectedTables] = useContext(TableContext);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      if (!user) {
        onClose();
        setIsLoading(false);
        Alert.alert(
          "Bạn chưa đăng nhập",
          "Bạn cần đăng nhập để tiếp tục thanh toán",
          [{ text: "Ok", style: "cancel" }],
        );
        return;
      }

      const payload = {
        userId: user.userId,
        totalPrice,
      };

      const response = await postRequest("/payments/booking-payment", payload);

      if (response.status === 200) {
        Alert.alert("Thành công", "Bạn đã xác nhận đặt bàn thành công.");
        // Điều hướng nếu cần
      }
    } catch (error) {
      Alert.alert("Lỗi đặt bàn", "Đã có lỗi trong quá trình đặt bàn", [
        {
          text: "Đặt bàn khác",
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

      {/* 1. Thông tin bàn chơi */}
      <View className="mb-3">
        <Text className="font-semibold text-base text-black mb-1">
          🧩 Thông tin bàn chơi
        </Text>
        <Text>
          Phòng: {roomName} ({roomType})
        </Text>
        <Text>
          Thời gian: {startTime} - {endTime}
        </Text>
      </View>

      {/* 2. Thông tin đối thủ */}
      <View className="mb-3">
        <Text className="font-semibold text-base text-black mb-1">
          👤 Người mời
        </Text>
        <Text>{fullName}</Text>
      </View>

      {/* 3. Danh sách bàn và tiền */}

      <View className="bg-gray-100 p-3 rounded-lg shadow mb-2 border border-gray-200">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-base font-semibold text-black">
            Bàn {roomName}
          </Text>
        </View>

        <View className="flex-row justify-between items-center">
          <Text className="text-gray-700">Loại bàn:</Text>
          <Text className="text-black font-bold">{roomType} VND</Text>
        </View>
      </View>

      {/* 4. Tổng tiền */}
      <Text className="text-center text-lg font-bold mt-2 mb-4 text-green-600">
        Tổng tiền: {totalPrice} VND
      </Text>

      <Dialog.Actions>
        <Dialog.Button title="Đồng ý" onPress={handleConfirm} />
        <Dialog.Button title="Từ chối" onPress={onClose} />
      </Dialog.Actions>
    </Dialog>
  );
}
