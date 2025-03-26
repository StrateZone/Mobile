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
import Ionicons from "@expo/vector-icons/Ionicons";

import { getRequest } from "@/helpers/api-requests";
import TableCard from "@/components/card/table_card";
import {
  clearSelectedTables,
  getSelectedTables,
  toggleTableSelection,
} from "@/context/select-table";
import { roundToNearest30Minutes } from "@/helpers/round_to_nearest_30minutes";

import { RootStackParamList } from "../../../constants/types/root-stack";
import { ChessTable } from "@/constants/types/chess_table";

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function AppointmentScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [chessTables, setChessTables] = useState<ChessTable[]>([]);
  const [goTables, setGoTables] = useState<ChessTable[]>([]);
  const [xiangqiTables, setXiangqiTables] = useState<ChessTable[]>([]);
  const [selectedTables, setSelectedTables] = useState<ChessTable[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Thêm trạng thái loading
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchTables = async () => {
      setIsLoading(true);
      let now = new Date();
      now.setUTCHours(now.getUTCHours() + 7); 
  
      let startTime = new Date(now);
      let endTime = new Date(now);
  
     
       
        startTime.setUTCDate(startTime.getUTCDate() + 1);
        endTime.setUTCDate(endTime.getUTCDate() + 1);
  
    
      startTime.setUTCHours(8, 0, 0, 0);
      endTime.setUTCHours(22, 0, 0, 0);
  
      const formattedStartTime = startTime.toISOString();
      const formattedEndTime = endTime.toISOString();

      try {
        const response = await getRequest("/tables/available/each", {
          tableCount: 2,
          StartTime: formattedStartTime,
          EndTime: formattedEndTime,
        });
  
        setChessTables(response.chess || []);
        setGoTables(response.go || []);
        setXiangqiTables(response.xiangqi || []);
      } catch (error) {
        console.error("Error fetching tables", error);
      } finally {
        setIsLoading(false);
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
    <View className="mb-6">
      <View className="flex-row items-center justify-between bg-gray-800/90 px-5 py-3 rounded-xl border border-gray-500">
        <Text className="text-white/90 text-lg font-semibold tracking-wide">
          {gameType}
        </Text>
        <TouchableOpacity
          className="bg-gray-800 p-2 rounded-full"
          onPress={() => navigation.navigate("list_table", { gameType })}
        >
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex items-center justify-center p-5">
          <Button title="Loading..." type="solid" loading />
        </View>
      ) : (
        tables.map((table) => (
          <TableCard
            key={table.tableId}
            table={table}
            isSelected={selectedTables.some((t) => t.tableId === table.tableId)}
            onPress={() => handleToggleTable(table)}
          />
        ))
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-gray-200 p-4">
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
              titleStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}
            />
          </View>
        </Animated.View>
      )}
    </View>
  );
}
