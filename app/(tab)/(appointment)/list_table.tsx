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
import { mapGameTypeToEnglish } from "@/helpers/map_game_type_to_english";
import BottomSheetFilterTable from "@/components/bottom_sheet/filter_table";
import { roundToNearest30Minutes } from "@/helpers/round_to_nearest_30minutes";

import { RootStackParamList } from "@/constants/types/root-stack";
import { ChessTable } from "@/constants/types/chess_table";

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type ListTableRouteProp = RouteProp<RootStackParamList, "list_table">;

type Props = {
  route: ListTableRouteProp;
};

export default function ListTableScreen({ route }: Props) {
  const navigation = useNavigation<NavigationProp>();
  const { gameType } = route.params;

  const now = new Date();
  const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  let startTime: Date;
  let endTime: Date;
  const currentHour = vietnamTime.getUTCHours();

  if (currentHour >= 6 && currentHour < 21) {
    startTime = new Date(vietnamTime);
        startTime.setHours(startTime.getHours() + 1, 0, 0, 0);
  } else {
    startTime = new Date(vietnamTime);
    startTime.setUTCDate(startTime.getUTCDate() + 1);
    startTime.setUTCHours(8, 0, 0, 0);
  }

  endTime = new Date(startTime);
  endTime.setUTCHours(startTime.getUTCHours() + 2);

  if (endTime.getUTCHours() > 21) {
    endTime.setUTCHours(21, 0, 0, 0);
  }

  const roundedStartTime = roundToNearest30Minutes(startTime);
  const roundedEndTime = roundToNearest30Minutes(endTime);

  const gameTypeEnglish = mapGameTypeToEnglish(gameType);

  const [chessTables, setChessTable] = useState<ChessTable[]>([]);
  const [selectedTables, setSelectedTables] = useState<ChessTable[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const [roomTypes, setRoomTypes] = useState(["basic"]);
  const [gameTypeFilter, setGameTypeFilter] = useState<string>(gameTypeEnglish);
  const [startDateFilter, setStartDateFilter] = useState<Date | null>(
    roundedStartTime,
  );
  const [endDateFilter, setEndDateFilter] = useState<Date | null>(
    roundedEndTime,
  );
  const [filterVisible, setFilterVisible] = useState(false);

  useEffect(() => {
    fetchTables();
    loadSelectedTables();
  }, []);

  const formatDateForApi = (date: Date | null) =>
    date ? date.toISOString().slice(0, 19) : null;


    console.log(gameTypeFilter,roomTypes,startDateFilter,endDateFilter)
  const fetchTables = async (
    gameTypes = gameTypeFilter,
    roomTypesFilter = roomTypes,
    startDate = startDateFilter,
    endDate = endDateFilter,
  ) => {
    setIsLoading(true);
    try {
      const response = await getRequest("/tables/available/filter", {
        gameTypes: gameTypes,
        roomTypes: roomTypesFilter,
        StartTime: formatDateForApi(startDate),
        EndTime: formatDateForApi(endDate),
      });
      setChessTable(response.pagedList);
    } catch (error) {
      console.error("Error fetching tables", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilter = (
    gameTypes: string,
    roomTypes: string[],
    startDate: Date | null,
    endDate: Date | null,
  ) => {
    setGameTypeFilter(gameTypes);
    setRoomTypes(roomTypes);
    setStartDateFilter(startDate);
    setEndDateFilter(endDate);
    fetchTables(gameTypes, roomTypes, startDate, endDate);
  };

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
            onPress={() => setFilterVisible(!filterVisible)}
          />
        </View>

        {isLoading ? (
          <View className="flex items-center justify-center p-5">
            <Button title="Loading..." type="solid" loading />
          </View>
        ) : (
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
      </View>

      {filterVisible && (
        <BottomSheetFilterTable
          onApplyFilter={applyFilter}
          onClose={() => setFilterVisible(false)}
        />
      )}
    </SafeAreaView>
  );
}
