import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import { Dialog, Button, Input } from "@rneui/themed";
import { Ionicons } from "@expo/vector-icons";
import { Fold } from "react-native-animated-spinkit";
import Toast from "react-native-toast-message";

import { putRequest, getRequest, postRequest } from "@/helpers/api-requests";
import { useAuth } from "@/context/auth-context";
import ExtendTimeConfirmationDialog from "./extend_time_confirmation_dialog";

type ExtendTimeDialogProps = {
  visible: boolean;
  onClose: () => void;
  tableId: number;
  appointmentId: number;
  onSuccess?: () => void;
};

export default function ExtendTimeDialog({
  visible,
  onClose,
  tableId,
  appointmentId,
  onSuccess,
}: ExtendTimeDialogProps) {
  const { authState } = useAuth();
  const user = authState?.user;
  const [minutes, setMinutes] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [extensionDetails, setExtensionDetails] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleExtendTime = async () => {
    const minutesNum = parseInt(minutes);
    if (isNaN(minutesNum) || minutesNum < 5) {
      Alert.alert("Lỗi", "Thời gian gia hạn phải từ 5 phút trở lên");
      return;
    }

    setIsLoading(true);
    try {
      const checkResponse = await getRequest(
        `/tables-appointment/extend-check/${tableId}`,
        {
          durationInMinutes: minutesNum,
        },
      );

      if (checkResponse.error || checkResponse.success) {
        Toast.show({
          type: "error",
          text1: "Lỗi",
          text2: checkResponse.error?.message || "Không thể gia hạn thời gian",
        });
        return;
      } else {
        setExtensionDetails(checkResponse);
        setShowConfirmation(true);
      }
    } catch (error: any) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: error?.message || "Không thể gia hạn thời gian",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmExtension = async () => {
    if (!user) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Bạn cần đăng nhập để tiếp tục",
      });
      return;
    }

    if (extensionDetails.table.totalPrice > (user.wallet.balance || 0)) {
      Alert.alert("Số dư không đủ để thanh toán!");
      return;
    }

    setIsLoading(true);
    try {
      const requestBody = {
        userId: user.userId,
        oldTablesAppointmentId: tableId,
        tableId: extensionDetails.table.tableId,
        appointmentId,
        startTime: extensionDetails.scheduleTime,
        endTime: extensionDetails.endTime,
        price: extensionDetails.table.totalPrice,
      };

      await postRequest(
        "/payments/extend-tables-appointment-payment",
        requestBody,
      );

      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: `Đã gia hạn thêm ${minutes} phút`,
      });

      if (onSuccess) {
        onSuccess();
      }
      setShowConfirmation(false);
      onClose();
    } catch (error: any) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: error?.message || "Không thể gia hạn thời gian",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog
        isVisible={visible && !showConfirmation}
        onBackdropPress={onClose}
      >
        <Dialog.Title title="Gia hạn thời gian" />
        <View className="space-y-4">
          <View className="space-y-2">
            <Text className="text-base font-medium text-gray-700">
              Nhập số phút muốn gia hạn:
            </Text>
            <Input
              placeholder="Tối thiểu 5 phút"
              keyboardType="numeric"
              value={minutes}
              onChangeText={setMinutes}
              leftIcon={<Ionicons name="time-outline" size={24} color="gray" />}
            />
          </View>

          <View className="flex-row justify-end space-x-3">
            <Button
              title="Đóng"
              type="outline"
              onPress={onClose}
              buttonStyle={{
                borderColor: "#6b7280",
                paddingVertical: 8,
                paddingHorizontal: 16,
              }}
              titleStyle={{ color: "#6b7280" }}
              disabled={isLoading}
            />
            <Button
              title={
                isLoading ? (
                  <View className="flex-row items-center justify-center gap-2">
                    <Fold size={16} color="white" />
                    <Text className="text-white">Đang xử lý</Text>
                  </View>
                ) : (
                  "Xác nhận"
                )
              }
              onPress={handleExtendTime}
              buttonStyle={{
                backgroundColor: "#10b981",
                paddingVertical: 8,
                paddingHorizontal: 16,
              }}
              disabled={isLoading}
            />
          </View>
        </View>
      </Dialog>

      {extensionDetails && (
        <ExtendTimeConfirmationDialog
          visible={showConfirmation}
          onClose={() => {
            setShowConfirmation(false);
            setExtensionDetails(null);
          }}
          extensionDetails={extensionDetails}
          onConfirm={handleConfirmExtension}
        />
      )}
    </>
  );
}
