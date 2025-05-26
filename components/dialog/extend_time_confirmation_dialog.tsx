import React from "react";
import { View, Text } from "react-native";
import { Dialog, Button } from "@rneui/themed";
import { FontAwesome5 } from "@expo/vector-icons";

type ExtensionDetails = {
  durationInHours: number;
  endTime: string;
  id: number;
  note: string;
  oldId: number;
  scheduleTime: string;
  table: {
    durationInHours: number;
    endDate: string;
    gameType: {
      status: string;
      typeId: number;
      typeName: string;
    };
    gameTypeId: number;
    gameTypePrice: number;
    roomDescription: string;
    roomId: number;
    roomName: string;
    roomType: string;
    roomTypePrice: number;
    startDate: string;
    tableId: number;
    totalPrice: number;
  };
};

type ExtendTimeConfirmationDialogProps = {
  visible: boolean;
  onClose: () => void;
  extensionDetails: ExtensionDetails;
  onConfirm: () => void;
};

export default function ExtendTimeConfirmationDialog({
  visible,
  onClose,
  extensionDetails,
  onConfirm,
}: ExtendTimeConfirmationDialogProps) {
  return (
    <Dialog isVisible={visible} onBackdropPress={onClose}>
      <Dialog.Title title="Xác nhận gia hạn thời gian" />
      <View className="space-y-4">
        <View className="space-y-2">
          <View className="flex-row items-center">
            <FontAwesome5 name="chess-board" size={20} color="#374151" />
            <Text className="ml-2 font-semibold text-lg text-gray-800">
              Thông tin gia hạn
            </Text>
          </View>

          <Text className="text-gray-700">
            <Text className="font-medium">Phòng:</Text>{" "}
            {extensionDetails.table.roomName}
          </Text>

          <Text className="text-gray-700">
            <Text className="font-medium">Loại phòng:</Text>{" "}
            {extensionDetails.table.roomType}
          </Text>

          <Text className="text-gray-700">
            <Text className="font-medium">Loại cờ:</Text>{" "}
            {extensionDetails.table.gameType.typeName}
          </Text>

          <Text className="text-gray-700">
            <Text className="font-medium">Thời gian bắt đầu:</Text>{" "}
            {new Date(extensionDetails.scheduleTime).toLocaleString()}
          </Text>

          <Text className="text-gray-700">
            <Text className="font-medium">Thời gian kết thúc:</Text>{" "}
            {new Date(extensionDetails.endTime).toLocaleString()}
          </Text>

          <Text className="text-gray-700">
            <Text className="font-medium">Thời gian gia hạn:</Text>{" "}
            {Math.round(extensionDetails.durationInHours * 60)} phút
          </Text>

          <View className="bg-green-50 p-3 rounded-xl border border-green-200 mt-2">
            <Text className="text-center text-base text-gray-800 font-medium">
              Phí gia hạn
            </Text>
            <Text className="text-center text-xl font-bold text-green-600 mt-1">
              {extensionDetails.table.totalPrice.toLocaleString("vi-VN")} VND
            </Text>
          </View>

          <Text className="text-gray-500 italic mt-2">
            {extensionDetails.note}
          </Text>
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
          />
          <Button
            title="Xác nhận"
            onPress={onConfirm}
            buttonStyle={{
              backgroundColor: "#10b981",
              paddingVertical: 8,
              paddingHorizontal: 16,
            }}
          />
        </View>
      </View>
    </Dialog>
  );
}
