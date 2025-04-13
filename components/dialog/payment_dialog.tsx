import { View, Text, Alert } from "react-native";
import React, { useContext, useState } from "react";
import { Dialog } from "@rneui/themed";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Fold } from "react-native-animated-spinkit";

import { TableContext } from "@/context/select-table";
import { useAuth } from "@/context/auth-context";
import { postRequest } from "@/helpers/api-requests";
import { RootStackParamList } from "@/constants/types/root-stack";

export type DialogType = {
  visible: boolean;
  totalPrice: number;
  tableOpponents: Record<number, any[]>;
  setIsPaymentSuccessful: (payment: boolean) => void;
  onClose: () => void;
  setIsLoading: (loading: boolean) => void;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PaymentDialog({
  visible,
  totalPrice,
  tableOpponents,
  onClose,
  setIsPaymentSuccessful,
  setIsLoading,
}: DialogType) {
  const { authState } = useAuth();
  const user = authState?.user;
  const navigation = useNavigation<NavigationProp>();

  const [
    selectedTables,
    toggleTableSelection,
    clearSelectedTables,
    removeSelectedTable,
    clearSelectedTablesWithNoInvite,
  ] = useContext(TableContext);

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

      if (totalPrice > (user?.wallet.balance || 0)) {
        onClose();
        Alert.alert("Số dư không đủ để thanh toán!");
      }

      onClose();
      const payload = {
        userId: user.userId,
        tablesAppointmentRequests: selectedTables.map((table: any) => {
          const hasInvitedUsers =
            table.invitedUsers && table.invitedUsers.length > 0;
          return {
            price: hasInvitedUsers ? table.totalPrice / 2 : table.totalPrice,
            tableId: table.tableId,
            scheduleTime: table.startDate,
            endTime: table.endDate,
            invitedUsers: table.invitedUsers || [],
          };
        }),
        totalPrice: totalPrice,
      };

      const response = await postRequest("/payments/booking-payment", payload);

      if (response.status === 200) {
        navigation.navigate("payment_successfull");
        setIsPaymentSuccessful(true);
        await clearSelectedTablesWithNoInvite();
      }
    } catch (error) {
      Alert.alert("Lỗi đặt bàn", "Đã có người đặt bàn này", [
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
      <>
        <Dialog.Title title="Xác nhận thanh toán" />
        <Text className="text-lg font-bold text-center mb-4">
          Số lượng bàn: {selectedTables.length}
        </Text>
        <Text className="text-lg font-bold text-center mb-4">
          Tổng tiền: {totalPrice.toLocaleString("vi-VN")} VND
        </Text>

        {selectedTables.map((table: any, index: number) => {
          const opponents = tableOpponents[table.tableId] || [];

          const opponentStatusText = (() => {
            if (table.invitedUsers && table.invitedUsers.length > 0)
              return "Đã mời đối thủ";
            return "Không mời đối thủ";
          })();

          const price =
            table.invitedUsers && table.invitedUsers.length > 0
              ? table.totalPrice / 2
              : table.totalPrice;

          return (
            <View
              key={index}
              className="bg-white p-3 rounded-lg shadow mb-2 border border-gray-200"
            >
              <View className="flex-row justify-between items-center mb-1">
                <Text className="font-semibold text-base text-black">
                  Bàn {table.tableId}
                </Text>
                <Text
                  className={`text-sm font-medium ${
                    table.invitedUsers && table.invitedUsers.length > 0
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {opponentStatusText}
                </Text>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-gray-700">Thành tiền:</Text>
                <Text className="text-black font-bold">
                  {price.toLocaleString("vi-VN")} VND
                </Text>
              </View>
            </View>
          );
        })}

        <Dialog.Actions>
          <Dialog.Button title="Xác nhận" onPress={handleConfirm} />
          <Dialog.Button title="Hủy" onPress={onClose} />
        </Dialog.Actions>
      </>
    </Dialog>
  );
}
