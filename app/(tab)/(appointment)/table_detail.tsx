import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useContext, useEffect, useRef, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { getRequest } from "@/helpers/api-requests";
import { ChessTable } from "@/constants/types/chess_table";
import { TableContext } from "@/context/select-table";
import { Button } from "@rneui/themed";

import { mapGameTypeToVietnamese } from "@/helpers/map_game_type_by_language";
import { formatDateTime } from "@/helpers/format_time";

import { RootStackParamList } from "@/constants/types/root-stack";
import { Fold } from "react-native-animated-spinkit";
import BackButton from "@/components/BackButton";
import { capitalizeWords } from "@/helpers/capitalize_first_letter";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ListTableRouteProp = RouteProp<RootStackParamList, "table_detail">;

type Props = {
  route: ListTableRouteProp;
};

export default function TableDetail({ route }: Props) {
  const navigation = useNavigation<NavigationProp>();
  const { tableId, startDate, endDate } = route.params;

  const [
    selectedTables,
    toggleTableSelection,
    removeSelectedTable,
    clearSelectedTables,
    clearSelectedTablesWithNoInvite,
  ] = useContext(TableContext);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tableDetail, setTableDetail] = useState<ChessTable>();

  const buttonAnim = useRef(new Animated.Value(0)).current;

  const start = formatDateTime(startDate);
  const end = formatDateTime(endDate);

  useEffect(() => {
    setIsLoading(true);
    getRequest(`/tables/${tableId}`, { StartTime: startDate, EndTime: endDate })
      .then((tableDetail) => {
        setTableDetail(tableDetail);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const isTableSelected = (
    selectedTables: ChessTable[],
    tableDetail: ChessTable,
  ) => {
    return selectedTables.some(
      (t) =>
        t.tableId === tableDetail.tableId &&
        t.startDate === tableDetail.startDate &&
        t.endDate === tableDetail.endDate,
    );
  };

  useEffect(() => {
    if (selectedTables.length > 0) {
      Animated.spring(buttonAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 5,
        bounciness: 10,
      }).start();
    } else {
      Animated.timing(buttonAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedTables]);

  const handleToggleTable = async (table: ChessTable) => {
    await toggleTableSelection(table);
  };

  const handleClearTables = async () => {
    await clearSelectedTables();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F4F5F7" /* neutral */ }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View
          style={{
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <BackButton customAction={() => navigation.goBack()} />
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: "#212529" /* neutral-900 */,
            }}
          >
            Chi tiết bàn
          </Text>
          <View style={{ width: 48 }} />
        </View>
        {tableDetail ? (
          <ScrollView className="flex-1 p-6 mt-10">
            <Text className="text-2xl font-bold text-center text-black mb-5">
              Chi tiết bàn số: {tableDetail.tableId}
            </Text>
            <View className="bg-white p-6 rounded-2xl shadow-md">
              <Text className="text-lg text-gray-700 mt-2">
                <FontAwesome5 name="door-closed" size={18} color="black" /> Tên
                phòng:{" "}
                <Text className="font-semibold">
                  {capitalizeWords(tableDetail.roomName)}
                </Text>
              </Text>
              <Text className="text-lg text-gray-700 mt-2">
                <FontAwesome5 name="chess" size={18} color="black" /> Loại cờ:{" "}
                <Text className="font-semibold">
                  {capitalizeWords(tableDetail.gameType.typeName)} (
                  {tableDetail.gameTypePrice.toLocaleString("vi-VN")} vnd/giờ)
                </Text>
              </Text>

              <Text className="text-lg text-gray-700 mt-2">
                <Ionicons name="home-outline" size={20} color="black" /> Loại
                phòng:{" "}
                <Text className="text-lg font-bold">
                  {capitalizeWords(tableDetail.roomType)}(
                  {tableDetail.roomTypePrice.toLocaleString("vi-VN")} vnd/giờ)
                </Text>
              </Text>

              <Text className="text-lg text-gray-700 mt-2">
                <Ionicons name="calendar-outline" size={18} color="black" />{" "}
                Ngày: <Text className="font-semibold">{start.date}</Text>
              </Text>

              <Text className="text-lg text-gray-700 mt-2">
                <Ionicons name="time-outline" size={18} color="black" /> Giờ
                chơi:{" "}
                <Text className="font-semibold">
                  {start.time} - {end.time}
                </Text>
              </Text>

              {tableDetail?.roomDescription && (
                <View className="mt-4">
                  <Text className="text-lg font-semibold text-black">
                    <FontAwesome5 name="info-circle" size={18} color="black" />{" "}
                    Mô tả phòng:
                  </Text>
                  {tableDetail?.roomDescription
                    .split("\\n")
                    .map((desc, index) => (
                      <View key={index} className="flex-row items-center mt-2">
                        <FontAwesome5
                          name="check-circle"
                          size={16}
                          color="green"
                        />
                        <Text className="ml-2 text-lg text-gray-700">
                          {desc.trim()}
                        </Text>
                      </View>
                    ))}
                </View>
              )}

              <Text className="text-lg text-gray-700 mt-2">
                <FontAwesome5 name="money-bill-wave" size={18} color="black" />{" "}
                Giá:{" "}
                <Text className="font-bold text-green-600 text-xl">
                  {tableDetail.totalPrice.toLocaleString("vi-VN")} VND
                </Text>
              </Text>

              {tableDetail && (
                <Button
                  title={
                    isTableSelected(selectedTables, tableDetail)
                      ? "✔ Đã chọn"
                      : "Chọn bàn"
                  }
                  disabled={isTableSelected(selectedTables, tableDetail)}
                  buttonStyle={{
                    backgroundColor: isTableSelected(
                      selectedTables,
                      tableDetail,
                    )
                      ? "#888"
                      : "black",
                    borderRadius: 8,
                    marginTop: 12,
                    paddingVertical: 10,
                  }}
                  titleStyle={{ fontSize: 16 }}
                  onPress={() => handleToggleTable(tableDetail)}
                />
              )}
            </View>
          </ScrollView>
        ) : (
          <View className="flex justify-center items-center mt-32">
            <Fold size={48} color="#000000" />
          </View>
        )}

        {selectedTables.length > 0 && (
          <Animated.View
            style={{
              transform: [
                {
                  scale: buttonAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
                {
                  translateY: buttonAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
              opacity: buttonAnim,
            }}
          >
            <View className="flex-row justify-between p-3 rounded-lg shadow-lg">
              <Button
                title="Xóa hết"
                onPress={handleClearTables}
                buttonStyle={{
                  backgroundColor: "red",
                  borderRadius: 10,
                  paddingVertical: 10,
                }}
                titleStyle={{ fontWeight: "bold", fontSize: 16 }}
              />
              <Button
                title={`Chọn ${selectedTables.length} bàn`}
                onPress={() => navigation.navigate("booking_detail")}
                buttonStyle={{
                  backgroundColor: "black",
                  borderRadius: 10,
                  paddingVertical: 12,
                }}
                titleStyle={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: 16,
                }}
              />
            </View>
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
