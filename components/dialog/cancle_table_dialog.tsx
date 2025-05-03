import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import { Dialog, Button } from "@rneui/themed";
import Toast from "react-native-toast-message";
import { Fold } from "react-native-animated-spinkit";

import { putRequest } from "@/helpers/api-requests";
import { useAuth } from "@/context/auth-context";
import LoadingForButton from "../loading/loading_button";

type ConfirmCancelTableDialogProps = {
  visible: boolean;
  onClose: () => void;
  data: {
    refundStatus: number;
    refundAmount: number;
    message: string;
    cancellationTime: string;
    cancellation_Block_TimeGate?: string | null;
    cancellation_PartialRefund_TimeGate?: string | null;
  };
  tableId: number;
  onSuccess?: () => void;
};

export default function ConfirmCancelTableDialog({
  visible,
  onClose,
  data,
  tableId,
  onSuccess,
}: ConfirmCancelTableDialogProps) {
  const { authState } = useAuth();
  const user = authState?.user;

  const [isLoading, setIsLoading] = useState(false);

  const formatUtcDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getUTCDate().toString().padStart(2, "0")} ${date
      .getUTCHours()
      .toString()
      .padStart(
        2,
        "0",
      )}:${date.getUTCMinutes().toString().padStart(2, "0")}:${date
      .getUTCSeconds()
      .toString()
      .padStart(2, "0")}`;
  };

  const handleConfirmCancel = async () => {
    setIsLoading(true);
    try {
      const response = await putRequest(
        `/tables-appointment/cancel/${tableId}/users/${user?.userId}`,
        {},
      );

      const responseData = response as any as {
        success: boolean;
        error?: {
          message: string;
          unavailable_tables?: any[];
        };
        status: number;
      };

      if (
        responseData.error ===
        "Cancellation failed: Cannot cancel incoming appointments."
      ) {
        Toast.show({
          type: "error",
          text1: "Thất bại",
          text2: "Bàn này không thể hủy vì sắp tới giờ chơi",
        });
      }

      if (responseData.status === 200) {
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: "Đã hủy bàn",
        });
        onSuccess?.();
        onClose();
      }
    } catch (e) {
      Alert.alert("Lỗi", "Không thể hủy bàn.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      isVisible={visible}
      onBackdropPress={onClose}
      overlayStyle={{ borderRadius: 12 }}
    >
      <View className="space-y-4">
        <Text className="text-xl font-bold text-center text-red-600">
          Xác nhận huỷ bàn
        </Text>

        <Text className="text-base text-black">
          {data.message || "Thông tin hoàn tiền không khả dụng."}
        </Text>

        <View className="space-y-1">
          <Text className="text-base text-black">
            <Text className="font-semibold">Số tiền nhận lại:</Text>{" "}
            {data.refundAmount.toLocaleString("vi-VN")} VND
          </Text>

          <Text className="text-base text-black">
            <Text className="font-semibold">Thời gian huỷ:</Text>{" "}
            {formatUtcDateTime(data.cancellationTime)}
          </Text>

          {data.cancellation_PartialRefund_TimeGate && (
            <Text className="text-base text-black">
              <Text className="font-semibold">Hạn hoàn tiền một phần:</Text>{" "}
              {formatUtcDateTime(data.cancellation_PartialRefund_TimeGate)}
            </Text>
          )}
        </View>

        <View className="flex-row justify-end gap-2 pt-4">
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
                  <LoadingForButton />
                  <Text className="text-black text-sm">Đang xử lý</Text>
                </View>
              ) : (
                "Xác nhận huỷ"
              )
            }
            onPress={handleConfirmCancel}
            buttonStyle={{
              backgroundColor: "#ef4444",
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
