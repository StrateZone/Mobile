import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Button } from "@rneui/themed";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import AntDesign from "@expo/vector-icons/AntDesign";
import Toast from "react-native-toast-message";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Fold } from "react-native-animated-spinkit";

import { mapGameTypeToVietnamese } from "@/helpers/map_game_type_by_language";
import { useAuth } from "@/context/auth-context";
import PaymentDialog from "@/components/dialog/payment_dialog";
import { TableContext } from "@/context/select-table";
import { getRequest } from "@/helpers/api-requests";
import { formatDateTime } from "@/helpers/format_time";

import { ChessTable } from "@/constants/types/chess_table";
import { RootStackParamList } from "@/constants/types/root-stack";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BookingDetailScreen() {
  const [
    selectedTables,
    toggleTableSelection,
    removeSelectedTable,
    clearSelectedTables,
    clearSelectedTablesWithNoInvite,
  ] = useContext(TableContext);

  const navigation = useNavigation<NavigationProp>();
  const { authState, onUpdateUserBalance } = useAuth();
  const user = authState?.user;

  const [totalPrice, setTotalPrice] = useState(0);
  const [opneDialog, setOpenDialog] = useState(false);
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tableOpponents, setTableOpponents] = useState<Record<number, any[]>>(
    {},
  );

  useFocusEffect(
    useCallback(() => {
      if (onUpdateUserBalance) {
        onUpdateUserBalance();
      }
    }, []),
  );

  useEffect(() => {
    const fetchOpponents = async () => {
      const userId = user?.userId;

      if (!userId) return;

      const results: Record<number, any[]> = {};

      await Promise.all(
        selectedTables.map(async (table: any) => {
          try {
            const response = await getRequest(
              `/appointmentrequests/users/${userId}/tables/${table.tableId}`,
              {
                startTime: table.startDate,
                endTime: table.endDate,
              },
            );

            const data = response;
            results[table.tableId] = data;
          } catch (error) {
            console.error("Lỗi khi gọi API:", error);
          }
        }),
      );

      setTableOpponents(results);
    };

    fetchOpponents();
  }, [selectedTables, user]);

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
    const newTotal = selectedTables.reduce((sum: number, table: ChessTable) => {
      const hasInvitedUsers =
        table.invitedUsers && table.invitedUsers.length > 0;
      const adjustedPrice = hasInvitedUsers
        ? table.totalPrice / 2
        : table.totalPrice;
      return sum + adjustedPrice;
    }, 0);

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

        {isLoading ? (
          <View className="flex justify-center items-center mt-32 mb-16">
            <Fold size={48} color="#000000" />
          </View>
        ) : (
          <>
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
                  <View
                    key={index}
                    className="bg-white p-4 rounded-xl mb-4 shadow"
                  >
                    <View className="flex-row justify-between items-center">
                      <Text className="text-lg font-semibold mb-2">
                        <FontAwesome5
                          name="chess-board"
                          size={20}
                          color="black"
                        />{" "}
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
                        Loại cờ:{" "}
                        {mapGameTypeToVietnamese(table.gameType.typeName)} (
                        {table.gameTypePrice.toLocaleString("vi-VN")} vnd/giờ)
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
                          <Ionicons
                            name="time-outline"
                            size={16}
                            color="gray"
                          />{" "}
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
                      {tableOpponents[table.tableId]?.some(
                        (item) => item.status === "accepted",
                      ) ? (
                        <View className="items-center">
                          <Text className="text-sm text-gray-600">Đối thủ</Text>
                          <Image
                            source={{
                              uri:
                                tableOpponents[table.tableId].find(
                                  (item) => item.status === "accepted",
                                )?.toUserNavigation?.avatarUrl ||
                                "https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg",
                            }}
                            className="w-12 h-12 rounded-full mt-1"
                          />
                        </View>
                      ) : (
                        <TouchableOpacity
                          onPress={() =>
                            navigation.navigate("find_opponents", {
                              tableId: table.tableId,
                              startDate: table.startDate,
                              endDate: table.endDate,
                              tablePrice: table.totalPrice / 2,
                            })
                          }
                        >
                          <AntDesign name="adduser" size={30} color="black" />
                        </TouchableOpacity>
                      )}

                      {(() => {
                        const hasInvitedUsers =
                          table.invitedUsers && table.invitedUsers.length > 0;
                        const displayedPrice = hasInvitedUsers
                          ? table.totalPrice / 2
                          : table.totalPrice;

                        return (
                          <Text className="font-bold text-green-600 mt-1 text-xl flex-row items-center">
                            <FontAwesome5
                              name="money-bill-wave"
                              size={16}
                              className="mr-1"
                            />{" "}
                            {displayedPrice.toLocaleString("vi-VN")} VND
                          </Text>
                        );
                      })()}
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
                onPress={() => {
                  if (totalPrice > (user?.wallet.balance || 0)) {
                    Alert.alert("Số dư không đủ để thanh toán!");
                  } else {
                    setOpenDialog(true);
                  }
                }}
                icon={
                  <FontAwesome5 name="check-circle" size={18} color="white" />
                }
                iconRight
              />

              <PaymentDialog
                visible={opneDialog}
                setIsPaymentSuccessful={setIsPaymentSuccessful}
                totalPrice={totalPrice}
                onClose={() => setOpenDialog(false)}
                setIsLoading={setIsLoading}
                tableOpponents={tableOpponents}
              />
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
