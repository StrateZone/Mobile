import { View, Text } from "react-native";
import React from "react";

export default function NotMember() {
  return (
    <View className="flex-1 justify-center items-center p-6 bg-neutral-50">
      <View className="bg-white rounded-xl p-6 shadow-md border border-neutral-200 w-full">
        <Text className="text-lg font-semibold text-neutral-900 text-center mb-4">
          Thông báo
        </Text>
        <Text className="text-neutral-700 text-center">
          Bạn cần trờ thành thành viên để truy cập cộng đồng
        </Text>
      </View>
    </View>
  );
}
