import { View, Text, Alert } from "react-native";
import React, { useContext, useState } from "react";
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
  totalPrice: number;
  setIsPaymentSuccessful: (payment: boolean) => void;
  onClose: () => void;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PaymentDialog({
  visible,
  totalPrice,
  onClose,
  setIsPaymentSuccessful,
}: DialogType) {
  const { authState } = useAuth();
  const user = authState?.user;

  const navigation = useNavigation<NavigationProp>();

  const [selectedTables, toggleTableSelection, clearSelectedTables] =
    useContext(TableContext);

  const handleConfirm = async () => {
    try {
      if (!user) {
        onClose();
        Alert.alert(
          "Bạn chưa đăng nhập",
          "Bạn cần đăng nhập để tiếp tục thanh toán",
          [
            {
              text: "Ok",
              onPress: () => {},
              style: "cancel",
            },
          ],
        );
      } else {
        const payload = {
          userId: user.userId,
          tablesAppointmentRequests: selectedTables.map(
            (table: ChessTable) => ({
              price: table.totalPrice,
              tableId: table.tableId,
              scheduleTime: table.startDate,
              endTime: table.endDate,
            }),
          ),
          totalPrice: totalPrice,
        };

        const response = await postRequest(
          "/payments/booking-payment",
          payload,
        );

        if (response.status === 200) {
          navigation.navigate("payment_successfull");
          setIsPaymentSuccessful(true);
          await clearSelectedTables();
        }
        onClose();
      }
    } catch (error) {
      onClose();
      Alert.alert("Lỗi đặt bàn", "Đã có người đặt bàn này", [
        {
          text: "Đặt bàn khác",
          onPress: () => {
            navigation.goBack();
          },
          style: "cancel",
        },
      ]);
    }
  };

  return (
    <Dialog isVisible={visible} onBackdropPress={onClose}>
      <Dialog.Title title="Xác nhận thanh toán" />
      <Text className="text-lg font-bold text-center mb-4">
        Số lượng bàn: {selectedTables.length}
      </Text>
      <Text className="text-lg font-bold text-center mb-4">
        Tổng tiền: {totalPrice.toLocaleString("vi-VN")} VND
      </Text>

      {selectedTables.map((table: ChessTable, index: number) => (
        <View key={index} style={{ marginBottom: 5 }}>
          <Text>
            Bàn {table.tableId} - {table.totalPrice.toLocaleString("vi-VN")} VND
          </Text>
        </View>
      ))}

      <Dialog.Actions>
        <Dialog.Button title="Xác nhận" onPress={handleConfirm} />
        <Dialog.Button title="Hủy" onPress={onClose} />
      </Dialog.Actions>
    </Dialog>
  );
}
