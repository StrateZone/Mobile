import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Button, Icon } from "@rneui/themed";

import { ChessTable } from "@/constants/types/chess_table";
import { getSelectedTables } from "@/context/select-table";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function BookingDetailScreen() {
  const navigation = useNavigation();
  const [selectedTables, setSelectedTables] = useState<ChessTable[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchSelectedTables = async () => {
      const tables = await getSelectedTables();
      setSelectedTables(tables);
    };

    fetchSelectedTables();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="relative">
        <TouchableOpacity
          className="absolute left-4 top-2 p-2 bg-gray-300 rounded-full z-10"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View className="flex-1 p-4 mt-10">
        <Text className="text-2xl font-bold text-center text-black mb-5">
          Chi tiết đặt bàn
        </Text>

        <View className="bg-white p-4 rounded-xl mb-4">
          <Text className="text-lg font-semibold">
            Số lượng: {selectedTables.length} bàn
          </Text>
        </View>

        {selectedTables.map((table, index) => (
          <View key={index} className="bg-white p-4 rounded-xl mb-4 shadow">
            <Text className="text-lg font-semibold">
              Số bàn: {table.tableId}
            </Text>
            <Text>Ngày: {table.startDate}</Text>
            <Text>Trạng thái: Chưa đặt</Text>
            <Text>Loại cờ: {table.gameType.typeName}</Text>
            <Text>Phòng: {table.roomType}</Text>
            <Text>Số phòng: {table.roomId}</Text>
            <Text className="font-bold mt-2">
              Giá: {table.totalPrice.toLocaleString("vi-VN")} VND
            </Text>
          </View>
        ))}

        <View className="bg-white p-4 rounded-xl mt-4">
          <TouchableOpacity className="flex-row items-center mb-4">
            <Icon name="tag" type="feather" />
            <Text className="ml-2">Áp dụng ưu đãi</Text>
          </TouchableOpacity>
          {/* <Text className="text-lg font-semibold">Tổng giá: {totalPrice.toLocaleString()} VND</Text> */}
          <Button
            title="Xác nhận"
            buttonStyle={{
              backgroundColor: "black",
              borderRadius: 10,
              marginTop: 10,
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
