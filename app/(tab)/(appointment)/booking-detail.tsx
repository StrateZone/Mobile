import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Button } from "@rneui/themed";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import AntDesign from "@expo/vector-icons/AntDesign";
import Toast from "react-native-toast-message";

import { mapGameTypeToVietnamese } from "@/helpers/map_game_type_by_language";
import { useAuth } from "@/context/auth-context";

import { ChessTable } from "@/constants/types/chess_table";
import { TableContext } from "@/context/select-table";
import PaymentDialog from "@/components/dialog/payment_dialog";

export default function BookingDetailScreen() {
  const [selectedTables, removeSelectedTable] = useContext(TableContext);

  const navigation = useNavigation();
  const { authState, onUpdateUserBalance } = useAuth();
  const user = authState?.user;

  const [totalPrice, setTotalPrice] = useState(0);
  const [opneDialog, setOpenDialog] = useState(false);
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (onUpdateUserBalance) {
        onUpdateUserBalance();
      }
    }, []),
  );

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
      const total = selectedTables.reduce(
        (sum: number, table: ChessTable) => sum + table.totalPrice,
        0,
      );
      setTotalPrice(total);
    };

    fetchSelectedTables();
  }, []);

  useEffect(() => {
    const newTotal = selectedTables.reduce(
      (sum: number, table: ChessTable) => sum + table.totalPrice,
      0,
    );
    setTotalPrice(newTotal);

    if (selectedTables.length === 0 && !isPaymentSuccessful) {
      navigation.goBack();
      Toast.show({
        type: "error",
        text1: "Không có bàn đã chọn",
        text2: "Vui lòng chọn thêm bàn.",
      });
    }
  }, [selectedTables]);

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
          {selectedTables.map((table: ChessTable, index: any) => {
            const startDate = formatDateTime(table.startDate);
            const endDate = formatDateTime(table.endDate);
            return (
              <View key={index} className="bg-white p-4 rounded-xl mb-4 shadow">
                <View className="flex-row justify-between items-center">
                  <Text className="text-lg font-semibold mb-2">
                    <FontAwesome5 name="chess-board" size={20} color="black" />{" "}
                    Bàn: {table.tableId}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      removeSelectedTable(table);
                    }}
                  >
                    <Ionicons name="close-circle" size={24} color="red" />
                  </TouchableOpacity>
                </View>

                <View className="flex-row items-center mb-2">
                  <Ionicons name="home-outline" size={16} color="gray" />
                  <Text className="text-gray-700 ml-2">
                    Phòng:{" "}
                    {{
                      basic: "Cơ bản",
                      openspaced: "Không gian mở",
                      premium: "Cao cấp",
                    }[table.roomType] || table.roomType}{" "}
                    ({table.roomTypePrice.toLocaleString("vi-VN")} vnd/giờ)
                  </Text>
                </View>

                <View className="flex-row items-center mb-2">
                  <FontAwesome5 name="chess" size={16} color="gray" />
                  <Text className="text-gray-700 ml-2">
                    Loại cờ: {mapGameTypeToVietnamese(table.gameType.typeName)}{" "}
                    ({table.gameTypePrice.toLocaleString("vi-VN")} vnd/giờ)
                  </Text>
                </View>

                <View className="flex-row flex-wrap">
                  <View className="w-1/2">
                    <Text className="text-gray-700 mb-2">
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color="gray"
                      />
                      Ngày: {startDate.date}
                    </Text>
                    <Text className="text-gray-700 mb-2">
                      <Ionicons name="time-outline" size={16} color="gray" />{" "}
                      Giờ:
                      {startDate.time} - {endDate.time}
                    </Text>
                  </View>

                  <View className="w-1/2">
                    <Text className="text-gray-700 mb-2">
                      <Ionicons
                        name="location-outline"
                        size={16}
                        color="gray"
                      />
                      Số phòng: {table.roomId}
                    </Text>
                    <Text className="text-gray-700 mb-2">
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={16}
                        color="gray"
                      />
                      Thời gian chơi: {table.durationInHours} giờ
                    </Text>
                  </View>
                </View>

                <View className="mt-3 flex-row justify-around">
                  <AntDesign name="adduser" size={30} color="black" />
                  <Text className="font-bold text-green-600 mt-1 text-xl flex-row items-center">
                    <FontAwesome5
                      name="money-bill-wave"
                      size={16}
                      className="mr-1"
                    />
                    {table.totalPrice.toLocaleString("vi-VN")} VND
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View className="bg-white p-4 rounded-xl mt-4 shadow">
          <TouchableOpacity className="flex-row items-center mb-4">
            <FontAwesome5 name="tags" size={20} color="black" />
            <Text className="ml-2">Áp dụng ưu đãi</Text>
          </TouchableOpacity>

          <View className="flex-row items-center">
            <FontAwesome5 name="wallet" size={20} color="black" />
            <Text className="text-lg font-bold text-gray-700 ml-2">
              Số dư: {user?.wallet.balance.toLocaleString("vi-VN")} VND
            </Text>
          </View>

          <Text className="text-xl font-bold text-right text-green-700 mb-4">
            Tổng tiền: {totalPrice.toLocaleString("vi-VN")} VND
          </Text>
          <Button
            title="Xác nhận đặt bàn"
            disabled={selectedTables.length === 0}
            buttonStyle={{
              backgroundColor: "black",
              borderRadius: 10,
              paddingVertical: 12,
            }}
            onPress={() => setOpenDialog(true)}
            icon={<FontAwesome5 name="check-circle" size={18} color="white" />}
            iconRight
          />
          <PaymentDialog
            visible={opneDialog}
            setIsPaymentSuccessful={setIsPaymentSuccessful}
            totalPrice={totalPrice}
            onClose={() => setOpenDialog(false)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
