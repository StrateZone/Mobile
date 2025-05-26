import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Dialog, Button } from "@rneui/themed";
import { MaterialIcons } from "@expo/vector-icons";

type NoteDialogProps = {
  visible: boolean;
  onClose: () => void;
  note: string;
};

export default function NoteDialog({
  visible,
  onClose,
  note,
}: NoteDialogProps) {
  return (
    <Dialog isVisible={visible} onBackdropPress={onClose}>
      <Dialog.Title title="Ghi chú" />
      <View className="space-y-4">
        <View className="flex-row items-start space-x-2">
          <MaterialIcons name="note" size={24} color="#4B5563" />
          <ScrollView style={{ maxHeight: 200 }}>
            <Text className="text-gray-700 text-base leading-6">{note}</Text>
          </ScrollView>
        </View>

        <View className="flex-row justify-end">
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
        </View>
      </View>
    </Dialog>
  );
}
