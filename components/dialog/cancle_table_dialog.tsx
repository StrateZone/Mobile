import { View, Text, Alert } from "react-native";
import React, { useContext } from "react";
import { Button, Dialog } from "@rneui/themed";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Toast from "react-native-toast-message";


import { TableContext } from "@/context/select-table";
import { ChessTable } from "@/constants/types/chess_table";
import { useAuth } from "@/context/auth-context";
import { postRequest, putRequest } from "@/helpers/api-requests";
import { RootStackParamList } from "@/constants/types/root-stack";
import { formatDateTime } from "@/helpers/format_time";

export type DialogType = {
  visible: boolean;
  price: number
  checkTable:any
  onClose: () => void;
  setIsLoading: (loading: boolean) => void;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ConfirmCancelTableDialog({
  visible,
  price,
  checkTable,
  onClose,
  setIsLoading,
}: DialogType) {
  const { authState } = useAuth();
  const user = authState?.user;
  const navigation = useNavigation<NavigationProp>();

  
// Enum refund status theo thứ tự
const refundStatusEnum = [
    "cancellation_fail",
    "no_refund",
    "no_refund_while_refund_for_invited_user",
    "refund_50_percentage_of_total",
    "refund_100_percentage_of_total",
  ] as const;
  
 
  const refundStatusMessageMap: Record<typeof refundStatusEnum[number], string> = {
    cancellation_fail: "Hủy không thành công",
    no_refund: "không được hoàn tiền",
    no_refund_while_refund_for_invited_user: "không được hoàn tiền vì bàn có người được mời",
    refund_50_percentage_of_total: "hoàn tiền 50%",
    refund_100_percentage_of_total: "hoàn tiền 100%",
  };
  
  
  function getRefundStatusMessage(status: number | undefined): string {
    if (status === undefined || status < 0 || status >= refundStatusEnum.length) {
      return "Trạng thái hoàn tiền không xác định";
    }
  
    const key = refundStatusEnum[status];
    return refundStatusMessageMap[key];
  }
  
  const message = getRefundStatusMessage(checkTable?.refundStatus);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {

      const response = await putRequest(`/tables-appointment/cancel/${checkTable.tablesAppointmentModel.id}/users/${user?.userId}`, {});

      if (response.status === 200) {
        Toast.show({
            type: "succcess",
            text1: "Thành công",
            text2: "Đã hủy bàn",
          });
      }
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Lỗi",
            text2: "Lỗi trong quá trình đặt bàn",
          });
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <Dialog isVisible={visible} onBackdropPress={onClose}>
  <Dialog.Title title="Xác nhận hủy bàn đã đặt" />
  <View className="space-y-3">
    <Text className="text-base text-black font-semibold">Thông tin</Text>

    <Text className="text-base text-black">
      Nếu hủy bàn này ở thời điểm hiện tại, bạn sẽ được{" "}
      <Text className="text-gray-700">{message}</Text>
    </Text>

    {checkTable?.refundAmount !== undefined && (
      <Text className="text-base text-black">
        <Text className="font-semibold">Số tiền nhận lại được:</Text>{" "}
        {checkTable.refundAmount.toLocaleString("vi-VN")} đ
      </Text>
    )}

{checkTable?.cancellationTime && (
  <Text className="text-base text-black">
    <Text className="font-semibold">Thời gian hủy của bạn là:</Text>{" "}
    {formatDateTime(checkTable.cancellationTime).date} lúc {formatDateTime(checkTable.cancellationTime).time}
  </Text>
)}

{checkTable?.cancellation_Block_TimeGate && (
  <Text className="text-base text-black">
    <Text className="font-semibold">Hạn chót hủy đơn:</Text>{" "}
    {formatDateTime(checkTable.cancellation_Block_TimeGate).date} lúc {formatDateTime(checkTable.cancellation_Block_TimeGate).time}
  </Text>
)}

{checkTable?.cancellation_PartialRefund_TimeGate && (
  <Text className="text-base text-black">
    <Text className="font-semibold">Hạn hoàn tiền một phần:</Text>{" "}
    {formatDateTime(checkTable.cancellation_PartialRefund_TimeGate).date} lúc {formatDateTime(checkTable.cancellation_PartialRefund_TimeGate).time}
  </Text>
)}

  </View>

  <Dialog.Actions>
    <Dialog.Button title="Huỷ" onPress={onClose} />
    <Dialog.Button title="Xác nhận hủy bàn" onPress={handleConfirm} />
  </Dialog.Actions>
</Dialog>

  );
}
