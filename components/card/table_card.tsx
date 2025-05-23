import React from "react";
import { View } from "react-native";
import { Card, Text, Button } from "@rneui/themed";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ChessTable } from "@/constants/types/chess_table";
import { formatDateTime } from "@/helpers/format_time";

import { mapGameTypeToVietnamese } from "@/helpers/map_game_type_by_language";
import { RootStackParamList } from "@/constants/types/root-stack";
import { capitalizeWords } from "@/helpers/capitalize_first_letter";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type TableCardProps = {
  table: ChessTable;
  isSelected?: boolean;
  onPress: () => void;
};

export default function TableCard({
  table,
  isSelected = false,
  onPress,
}: TableCardProps) {
  const navigation = useNavigation<NavigationProp>();

  const start = formatDateTime(table.startDate);
  const end = formatDateTime(table.endDate);

  return (
    <Card containerStyle={{ borderRadius: 10, padding: 15, marginBottom: 10 }}>
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-bold">Bàn: {table.tableId}</Text>
      </View>

      <View className="flex-row items-center mb-2">
        <Ionicons name="home-outline" size={16} color="gray" />
        <Text className="text-gray-700 ml-2">
          Phòng: {capitalizeWords(table.roomType)}(
          {table.roomTypePrice.toLocaleString("vi-VN")} vnd/giờ)
        </Text>
      </View>

      <View className="flex-row items-center mb-2">
        <FontAwesome5 name="chess" size={16} color="gray" />
        <Text className="text-gray-700 ml-2">
          Loại cờ: {capitalizeWords(table.gameType.typeName)} (
          {table.gameTypePrice.toLocaleString("vi-VN")} vnd/giờ)
        </Text>
      </View>

      <View className="flex-row flex-wrap">
        <View className="w-1/2">
          <View className="flex-row items-center mb-2">
            <Ionicons name="calendar-outline" size={16} color="gray" />
            <Text className="text-gray-700 ml-2">Ngày: {start.date}</Text>
          </View>

          <View className="flex-row items-center mb-1">
            <Ionicons name="time-outline" size={16} color="gray" />
            <Text className="text-gray-700 ml-2">
              {start.time} - {end.time}
            </Text>
          </View>
        </View>

        <View className="w-1/2">
          <View className="flex-row items-center mb-1">
            <Ionicons name="location-outline" size={16} color="gray" />
            <Text className="text-gray-700 ml-2">
              Tên phòng: {table.roomName}
            </Text>
          </View>

          <View className="flex-row items-center mb-1">
            <Ionicons name="checkmark-circle-outline" size={16} color="gray" />
            <Text className="text-gray-700 ml-2">
              Tổng giờ chơi: {table.durationInHours} giờ
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row items-center justify-between mt-3">
        <Button
          title="Chi tiết bàn"
          buttonStyle={{
            backgroundColor: "green",
            borderRadius: 8,
            paddingVertical: 10,
          }}
          titleStyle={{ fontSize: 16 }}
          onPress={() =>
            navigation.navigate("table_detail", {
              tableId: table.tableId,
              startDate: table.startDate,
              endDate: table.endDate,
            })
          }
        />

        <View className="flex-row items-center">
          <Ionicons name="cash-outline" size={18} color="green" />
          <Text className="font-bold text-lg text-green-600 ml-2">
            {table.totalPrice.toLocaleString("vi-VN")} VND
          </Text>
        </View>
      </View>

      <Button
        title={isSelected ? "✔ Đã chọn" : "Chọn bàn"}
        disabled={isSelected}
        buttonStyle={{
          backgroundColor: isSelected ? "#888" : "black",
          borderRadius: 8,
          marginTop: 12,
          paddingVertical: 10,
        }}
        titleStyle={{ fontSize: 16 }}
        onPress={onPress}
      />
    </Card>
  );
}
