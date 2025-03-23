import React from "react";
import { View } from "react-native";
import { Card, Text, Button } from "@rneui/themed";
import { ChessTable } from "@/constants/types/chess_table";

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
  const formatDateTime = (isoString: string) => {
    const fixedIsoString = isoString.endsWith("Z")
      ? isoString
      : `${isoString}Z`;
    const dateObj = new Date(fixedIsoString);

    const day = String(dateObj.getUTCDate()).padStart(2, "0");
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
    const year = dateObj.getUTCFullYear();
    const date = `${day}-${month}-${year}`;

    const hours = String(dateObj.getUTCHours()).padStart(2, "0");
    const minutes = String(dateObj.getUTCMinutes()).padStart(2, "0");
    const time = `${hours}:${minutes}`;

    return { date, time };
  };

  const start = formatDateTime(table.startDate);
  const end = formatDateTime(table.endDate);

  return (
    <View>
      <Card containerStyle={{ borderRadius: 10, padding: 15 }}>
        <View className="flex-row justify-between mb-2">
          <Text className="text-lg font-semibold">Số bàn: {table.tableId}</Text>
          <Text className="text-lg font-semibold">Ngày: {start.date}</Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-lg font-semibold">
            Số phòng: {table.roomName}
          </Text>
          <Text className="text-lg font-semibold">
            Giờ: {start.time} - {end.time}
          </Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-base">
            Trạng thái: <Text className="font-semibold">Chưa đặt</Text>
          </Text>
          <Text className="text-base">
            Loại cờ:
            <Text className="font-semibold">{table.gameType.typeName}</Text>
          </Text>
        </View>
        <Button
          title={isSelected ? "Đã chọn" : "Chọn"}
          disabled={isSelected}
          buttonStyle={{
            backgroundColor: isSelected ? "#888" : "black",
            borderRadius: 5,
            marginTop: 10,
          }}
          onPress={onPress}
        />
      </Card>
    </View>
  );
}
