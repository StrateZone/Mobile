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
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { mapGameTypeToVietnamese } from "@/helpers/map_game_type_by_language";

import { ChessTable } from "@/constants/types/chess_table";
import { getSelectedTables } from "@/context/select-table";

export default function BookingDetailScreen() {
  const navigation = useNavigation();
  const [selectedTables, setSelectedTables] = useState<ChessTable[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const formatDateTime = (isoString: string) => {
    const fixedIsoString = isoString.endsWith("Z")
      ? isoString
      : `${isoString}Z`;
    const dateObj = new Date(fixedIsoString);

    const day = String(dateObj.getUTCDate()).padStart(2, "0");
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
    const year = dateObj.getUTCFullYear();
    const date = `${day}/${month}/${year}`;
    const hours = String(dateObj.getUTCHours()).padStart(2, "0");
    const minutes = String(dateObj.getUTCMinutes()).padStart(2, "0");
    const time = `${hours}:${minutes}`;
    return { date, time };
  };

  useEffect(() => {
    const fetchSelectedTables = async () => {
      const tables = await getSelectedTables();
      setSelectedTables(tables);

      const total = tables.reduce((sum, table) => sum + table.totalPrice, 0);
      setTotalPrice(total);
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

        <View className="bg-white p-4 rounded-xl mb-4 shadow">
          <Text className="text-lg font-semibold flex-row items-center">
            <FontAwesome5 name="table" size={20} color="black" /> Số lượng:{" "}
            {selectedTables.length} bàn
          </Text>
        </View>

        <ScrollView className="flex-1">
          {selectedTables.map((table, index) => {
            const startDate = formatDateTime(table.startDate);
            const endDate = formatDateTime(table.endDate);
            return (
              <View key={index} className="bg-white p-4 rounded-xl mb-4 shadow">
                <Text className="text-lg font-semibold mb-2">
                  <FontAwesome5 name="chess-board" size={20} color="black" />{" "}
                  Bàn: {table.tableId}
                </Text>

                <View className="flex-row flex-wrap">
                  <View className="w-1/2">
                    <Text className="text-gray-700">
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color="gray"
                      />
                      Ngày: {startDate.date}
                    </Text>
                    <Text className="text-gray-700">
                      <Ionicons name="time-outline" size={16} color="gray" />{" "}
                      Giờ:
                      {startDate.time} - {endDate.time}
                    </Text>
                    <Text className="text-gray-700">
                      <FontAwesome5 name="chess" size={16} color="gray" /> Loại
                      cờ: {mapGameTypeToVietnamese(table.gameType.typeName)}
                    </Text>
                  </View>

                  <View className="w-1/2">
                    <Text className="text-gray-700">
                      <Ionicons name="home-outline" size={16} color="gray" />{" "}
                      Phòng:
                      {{
                        basic: "Phòng cơ bản",
                        openspaced: "Phòng không gian mở",
                        premium: "Phòng cao cấp",
                      }[table.roomType] || table.roomType}
                    </Text>
                    <Text className="text-gray-700">
                      <Ionicons
                        name="location-outline"
                        size={16}
                        color="gray"
                      />
                      Số phòng: {table.roomId}
                    </Text>
                    <Text className="text-gray-700">
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={16}
                        color="gray"
                      />
                      Thời gian chơi: {table.durationInHours} giờ
                    </Text>
                  </View>
                </View>

                <Text className="font-bold mt-3 text-right text-lg text-green-600">
                  <FontAwesome5 name="money-bill-wave" size={16} />
                  {table.totalPrice.toLocaleString("vi-VN")} VND
                </Text>
              </View>
            );
          })}
        </ScrollView>

        <View className="bg-white p-4 rounded-xl mt-4 shadow">
          <TouchableOpacity className="flex-row items-center mb-4">
            <FontAwesome5 name="tags" size={20} color="black" />
            <Text className="ml-2">Áp dụng ưu đãi</Text>
          </TouchableOpacity>

          <Text className="text-xl font-bold text-right text-green-700 mb-4">
            Tổng tiền: {totalPrice.toLocaleString("vi-VN")} VND
          </Text>

          <Button
            title="Xác nhận đặt bàn"
            buttonStyle={{
              backgroundColor: "black",
              borderRadius: 10,
              paddingVertical: 12,
            }}
            icon={<FontAwesome5 name="check-circle" size={18} color="white" />}
            iconRight
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
