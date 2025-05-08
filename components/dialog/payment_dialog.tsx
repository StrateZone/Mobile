import { View, Text, Alert } from "react-native";
import React, { useContext, useState } from "react";
import { Dialog, Button } from "@rneui/themed";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Fold } from "react-native-animated-spinkit";
import { IconNode } from "@rneui/base";

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
  selectedVouchers: Record<number, any | null>;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PaymentDialog({
  visible,
  totalPrice,
  tableOpponents,
  onClose,
  setIsPaymentSuccessful,
  selectedVouchers,
}: DialogType) {
  const { authState } = useAuth();
  const user = authState?.user;
  const navigation = useNavigation<NavigationProp>();

  const [loading, setIsLoading] = useState(false);

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
        setIsLoading(false);
        onClose();
        Alert.alert(
          "Bạn chưa đăng nhập",
          "Bạn cần đăng nhập để tiếp tục thanh toán",
          [{ text: "Ok", style: "cancel" }],
        );
        return;
      }

      if (totalPrice > (user?.wallet.balance || 0)) {
        setIsLoading(false);
        onClose();
        Alert.alert("Số dư không đủ để thanh toán!");
        return;
      }

      const payload = {
        userId: user.userId,
        tablesAppointmentRequests: selectedTables.map((table: any) => {
          const hasInvitedUsers =
            table.invitedUsers && table.invitedUsers.length > 0;

          const voucher = selectedVouchers[table.tableId];
          let priceAfterVoucher = table.totalPrice;
          if (voucher) {
            priceAfterVoucher = Math.max(0, table.totalPrice - voucher.value);
          }

          const finalPrice = hasInvitedUsers
            ? priceAfterVoucher / 2
            : priceAfterVoucher;

          return {
            price: finalPrice,
            tableId: table.tableId,
            scheduleTime: table.startDate,
            endTime: table.endDate,
            invitedUsers: table.invitedUsers || [],
            voucherId: voucher?.voucherId || null,
          };
        }),
        totalPrice: totalPrice, // tổng tiền đã tính sau khi áp dụng voucher
      };

      const response = await postRequest("/payments/booking-payment", payload);

      const responseData = response as any as {
        success: boolean;
        error?: {
          message: string;
          unavailable_tables?: any[];
        };
        status: number;
      };

      if (responseData.success === false) {
        if (responseData.error?.message === "Some tables are not available") {
          const unavailableList = responseData.error.unavailable_tables || [];

          const tableMessages = unavailableList.map((table: any) => {
            const startDate = new Date(table.start_time);
            const endDate = new Date(table.end_time);

            const dateStr = startDate.toLocaleDateString("vi-VN", {
              weekday: "long",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });

            const startTime = startDate.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            });
            const endTime = endDate.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return `• Bàn ${table.table_id} (${startTime} - ${endTime}, ${dateStr})`;
          });

          const message =
            "Một số bàn đã có người đặt:\n\n" + tableMessages.join("\n");

          Alert.alert("Không thể đặt bàn", message, [
            {
              text: "Đặt bàn khác",
              style: "cancel",
            },
          ]);
          return;
        } else if (
          responseData.error === "Một bàn chỉ có thể mời tối đa 5 người"
        ) {
          Alert.alert("Không thể đặt bàn", responseData.error, [
            {
              text: "Quay lại",
              style: "cancel",
            },
          ]);
        } else if (responseData.error === "Can not select time in the past.") {
          const message = "Không thể đặt bàn vào thời gian trong quá khứ";

          Alert.alert("Không thể đặt bàn", message, [
            {
              text: "Đặt bàn khác",
              style: "cancel",
            },
          ]);
          return;
        } else {
          Alert.alert("Lỗi", responseData.error?.message || "Đã xảy ra lỗi");
          return;
        }
      }

      if (responseData.status === 200) {
        navigation.navigate("payment_successfull");
        setIsPaymentSuccessful(true);
        await clearSelectedTablesWithNoInvite();
      }
    } catch (error) {
      console.error("Lỗi không xác định:", error);
      Alert.alert("Lỗi không xác định", "Vui lòng thử lại sau");
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
              return "Đã chọn đối thủ để mời";
            return "Không mời đối thủ";
          })();

          // Áp dụng voucher nếu có
          const voucher = selectedVouchers[table.tableId];
          let priceAfterVoucher = table.totalPrice;
          if (voucher) {
            priceAfterVoucher = Math.max(0, table.totalPrice - voucher.value);
          }

          // Nếu có đối thủ, chia đôi
          const finalPrice =
            table.invitedUsers && table.invitedUsers.length > 0
              ? priceAfterVoucher / 2
              : priceAfterVoucher;

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
                  {finalPrice.toLocaleString("vi-VN")} VND
                </Text>
              </View>
            </View>
          );
        })}

        <Dialog.Actions>
          <Button
            title={loading ? "Đang xử lý..." : "Xác nhận"}
            onPress={handleConfirm}
            disabled={loading}
            loading={loading}
            buttonStyle={{ backgroundColor: "#22c55e" }}
            titleStyle={{ fontWeight: "600" }}
            icon={
              loading ? (
                <Fold size={16} color="white" style={{ marginRight: 8 }} />
              ) : undefined
            }
          />
          <Button
            title="Hủy"
            onPress={onClose}
            type="outline"
            buttonStyle={{ borderColor: "#6b7280" }}
            titleStyle={{ color: "#6b7280" }}
            disabled={loading}
          />
        </Dialog.Actions>
      </>
    </Dialog>
  );
}
