import React, { useEffect, useState, useRef } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Animated,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Button, Icon } from "@rneui/themed";

import { getRequest } from "@/helpers/api-requests";
import TableCard from "@/components/card/table_card";
import {
  clearSelectedTables,
  getSelectedTables,
  toggleTableSelection,
} from "@/context/select-table";

import { RootStackParamList } from "../../../constants/types/root-stack";
import { ChessTable } from "@/constants/types/chess_table";

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function AppointmentScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [chessTables, setChessTables] = useState<ChessTable[]>([]);
  const [goTables, setGoTables] = useState<ChessTable[]>([]);
  const [xiangqiTables, setXiangqiTables] = useState<ChessTable[]>([]);
  const [selectedTables, setSelectedTables] = useState<ChessTable[]>([]);
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchTables = async () => {
      const now = new Date();
      now.setHours(now.getHours() + 7);
      const startTime = new Date(now);
      startTime.setHours(startTime.getHours() + 3);
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 2);

      const formattedStartTime = startTime.toISOString().slice(0, 19);
      const formattedEndTime = endTime.toISOString().slice(0, 19);

      try {
        const response = await getRequest("/tables/available/each", {
          tableCount: 3,
          StartTime: formattedStartTime,
          EndTime: formattedEndTime,
        });

        setChessTables(response.chess || []);
        setGoTables(response.go || []);
        setXiangqiTables(response.xiangqi || []);
      } catch (error) {
        console.error("Error fetching tables", error);
      }
    };

    fetchTables();
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

  const renderTables = (tables: ChessTable[], gameType: string) => (
    <View className="mb-4">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="font-bold text-3xl">{gameType}</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("ListTable", { gameType })}
        >
          <Icon name="arrow-right" type="feather" />
        </TouchableOpacity>
      </View>
      {tables.map((table) => (
        <TableCard
          key={table.tableId}
          table={table}
          isSelected={selectedTables.some((t) => t.tableId === table.tableId)}
          onPress={() => handleToggleTable(table)}
        />
      ))}
    </View>
  );

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <ScrollView className="flex-1">
        {renderTables(chessTables, "Cờ vua")}
        {renderTables(goTables, "Cờ vây")}
        {renderTables(xiangqiTables, "Cờ tướng")}
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
  );
}
