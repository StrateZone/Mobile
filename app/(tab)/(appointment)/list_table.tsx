import React, { useEffect, useRef, useState } from "react";
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from "react-native";
import { Text, Button, Icon } from "@rneui/themed";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";

import TableCard from "@/components/card/table_card";
import { getRequest } from "@/helpers/api-requests";
import {
  clearSelectedTables,
  getSelectedTables,
  toggleTableSelection,
} from "@/context/select-table";

import { RootStackParamList } from "../../../constants/types/root-stack";
import { ChessTable } from "@/constants/types/chess_table";

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type ListTableRouteProp = RouteProp<RootStackParamList, "ListTable">;

export default function ListTableScreen({
  route,
}: {
  route: ListTableRouteProp;
}) {
  const navigation = useNavigation<NavigationProp>();
  const { gameType } = route.params;

  const [chessTables, setChessTable] = useState<ChessTable[]>([]);
  const [selectedTables, setSelectedTables] = useState<ChessTable[]>([]);
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const roomTypes = "basic";
  useEffect(() => {
    const now = new Date();
    now.setHours(now.getHours() + 7);

    const startTime = new Date(now);
    startTime.setHours(startTime.getHours() + 3);

    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 2);

    const formattedStartTime = startTime.toISOString().slice(0, 19);
    const formattedEndTime = endTime.toISOString().slice(0, 19);

    const mapGameTypeToEnglish = (gameType: string): string => {
      switch (gameType) {
        case "Cờ vua":
          return "chess";
        case "Cờ tướng":
          return "xiangqi";
        case "Cờ vây":
          return "go";
        default:
          return gameType;
      }
    };

    const gameTypeEnglish = mapGameTypeToEnglish(gameType);

    getRequest("/tables/available/filter", {
      gameTypes: gameTypeEnglish,
      StartTime: formattedStartTime,
      EndTime: formattedEndTime,
      roomTypes,
    })
      .then((response) => {
        setChessTable(response);
      })
      .catch(() => {});

    loadSelectedTables();
  }, []);

  const loadSelectedTables = async () => {
    const storedTables = await getSelectedTables();
    setSelectedTables(storedTables);
  };

  const handleToggleTable = async (table: ChessTable) => {
    const updatedTables = await toggleTableSelection(table);
    setSelectedTables(updatedTables || []);
  };

  const handleClearTables = async () => {
    await clearSelectedTables();
    setSelectedTables([]);
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
          {gameType}
        </Text>

        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1 mr-2">
            <TextInput
              placeholder="Tìm kiếm"
              className="bg-white p-3 rounded-lg shadow"
            />
          </View>
          <Button
            icon={<Icon name="filter" type="feather" color="white" />}
            buttonStyle={{ backgroundColor: "black", borderRadius: 10 }}
          />
        </View>

        <ScrollView className="flex-1">
          {chessTables.map((table) => (
            <TableCard
              key={table.tableId}
              table={table}
              isSelected={selectedTables.some(
                (t) => t.tableId === table.tableId,
              )}
              onPress={() => handleToggleTable(table)}
            />
          ))}
        </ScrollView>

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
            <Button
              title={`Chọn ${selectedTables.length} bàn`}
              onPress={() => navigation.navigate("booking_detail")}
              buttonStyle={{
                backgroundColor: "black",
                borderRadius: 10,
                paddingVertical: 12,
                marginTop: 10,
              }}
            />
            <Button
              title="Xóa hết"
              onPress={handleClearTables}
              buttonStyle={{
                backgroundColor: "red",
                borderRadius: 10,
                paddingVertical: 10,
                marginTop: 10,
              }}
            />
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}
