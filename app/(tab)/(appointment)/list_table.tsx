import React, { useContext, useEffect, useRef, useState } from "react";
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

import TableCard from "@/components/card/table_card";
import { getRequest } from "@/helpers/api-requests";

import BottomSheetFilterTable from "@/components/bottom_sheet/filter_table";
import { mapRoomTypesToEnglish } from "@/helpers/map_room_type_by_language";
import {
  mapGameTypeToEnglish,
  mapGameTypeToVietnamese,
} from "@/helpers/map_game_type_by_language";

import { RootStackParamList } from "@/constants/types/root-stack";
import { ChessTable } from "@/constants/types/chess_table";
import { TableContext } from "@/context/select-table";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ListTableRouteProp = RouteProp<RootStackParamList, "list_table">;

type Props = {
  route: ListTableRouteProp;
};

export default function ListTableScreen({ route }: Props) {
  const navigation = useNavigation<NavigationProp>();
  const { gameType, roomTypes, selectedDate, StartTime, EndTime } =
    route.params;

  const [selectedTables, toggleTableSelection, clearSelectedTables] =
    useContext(TableContext);

  const selectedDateObj = new Date(selectedDate);

  const createDateTime = (date: Date, time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const newDate = new Date(date);
    newDate.setUTCHours(hours, minutes, 0, 0);
    return newDate;
  };
  const defaultStartDate = createDateTime(selectedDateObj, StartTime);
  const defaultEndDate = createDateTime(selectedDateObj, EndTime);

  const [chessTables, setChessTable] = useState<ChessTable[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [roomType, setRoomTypes] = useState(mapRoomTypesToEnglish(roomTypes));
  const [gameTypeFilter, setGameTypeFilter] = useState<string>(
    mapGameTypeToEnglish(gameType),
  );
  const [startDateFilter, setStartDateFilter] =
    useState<Date>(defaultStartDate);
  const [endDateFilter, setEndDateFilter] = useState<Date>(defaultEndDate);
  const [filterVisible, setFilterVisible] = useState(false);

  const buttonAnim = useRef(new Animated.Value(0)).current;

  const formatDateForApi = (date: Date | null) =>
    date ? date.toISOString().slice(0, 19) + "Z" : null;

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async (
    gameTypes = gameTypeFilter,
    roomTypesFilter = roomType,
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
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="relative">
        {/* <TouchableOpacity
          className="absolute left-4 top-2 p-2 bg-gray-300 rounded-full z-10"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity> */}
      </View>
      <View className="flex-1 p-4 mt-10">
        <Text className="text-2xl font-bold text-center text-black mb-5">
          {mapGameTypeToVietnamese(gameTypeFilter)}
        </Text>

        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1 mr-2"></View>
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
                  (t: any) =>
                    t.tableId === table.tableId &&
                    t.startDate === table.startDate &&
                    t.endDate === table.endDate,
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
          gameType={gameTypeFilter}
          roomTypes={roomType}
          onApplyFilter={(gameTypes, roomTypes, startDate, endDate) => {
            setGameTypeFilter(gameTypes);
            setRoomTypes(roomTypes);
            setStartDateFilter(startDate);
            setEndDateFilter(endDate);
            fetchTables(gameTypes, roomTypes, startDate, endDate);
          }}
          onClose={() => setFilterVisible(false)}
        />
      )}
    </SafeAreaView>
  );
}
