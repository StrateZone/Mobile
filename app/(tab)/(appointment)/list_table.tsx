import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  ScrollView,
  SafeAreaView,
  Animated,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text, Button, Icon } from "@rneui/themed";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Fold } from "react-native-animated-spinkit";

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
import { Ionicons } from "@expo/vector-icons";
import BackButton from "@/components/BackButton";
import LoadingPage from "@/components/loading/loading_page";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ListTableRouteProp = RouteProp<RootStackParamList, "list_table">;

type Props = {
  route: ListTableRouteProp;
};

export default function ListTableScreen({ route }: Props) {
  const navigation = useNavigation<NavigationProp>();
  const { gameType, roomTypes, selectedDate, StartTime, EndTime } =
    route.params;

  const [
    selectedTables,
    toggleTableSelection,
    removeSelectedTable,
    clearSelectedTables,
    clearSelectedTablesWithNoInvite,
  ] = useContext(TableContext);

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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [roomType, setRoomTypes] = useState(mapRoomTypesToEnglish(roomTypes));
  const [gameTypeFilter, setGameTypeFilter] = useState<string>(
    mapGameTypeToEnglish(gameType),
  );
  const [startDateFilter, setStartDateFilter] =
    useState<Date>(defaultStartDate);
  const [endDateFilter, setEndDateFilter] = useState<Date>(defaultEndDate);
  const [filterVisible, setFilterVisible] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const buttonAnim = useRef(new Animated.Value(0)).current;

  const formatDateForApi = (date: Date | null) =>
    date ? date.toISOString().slice(0, 19) + "Z" : null;

  useEffect(() => {
    setPageNumber(1);
    fetchTables(gameTypeFilter, roomType, startDateFilter, endDateFilter, 1);
  }, []);

  const fetchTables = async (
    gameTypes = gameTypeFilter,
    roomTypesFilter = roomType,
    startDate = startDateFilter,
    endDate = endDateFilter,
    page = 1,
    isRefreshing = false,
  ) => {
    if (page === 1) {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }
    } else {
      setIsFetchingMore(true);
    }

    try {
      const response = await getRequest("/tables/available/filter", {
        gameTypes: gameTypes,
        roomTypes: roomTypesFilter,
        StartTime: formatDateForApi(startDate),
        EndTime: formatDateForApi(endDate),
        pageNumber: page,
        pageSize: pageSize,
      });

      const newData = response.pagedList || [];

      if (page === 1) {
        setChessTable(newData);
      } else {
        setChessTable((prev) => [...prev, ...newData]);
      }

      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Error fetching tables", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
      setIsFetchingMore(false);
    }
  };
  const handleRefresh = () => {
    setPageNumber(1);
    fetchTables(
      gameTypeFilter,
      roomType,
      startDateFilter,
      endDateFilter,
      1,
      true,
    );
  };

  const handleLoadMore = () => {
    if (isFetchingMore || pageNumber >= totalPages) return;

    const nextPage = pageNumber + 1;
    setPageNumber(nextPage);
    fetchTables(
      gameTypeFilter,
      roomType,
      startDateFilter,
      endDateFilter,
      nextPage,
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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F9FAFB" /* neutral-50 */ }}
    >
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
              color: "#111827" /* neutral-900 */,
            }}
          >
            {mapGameTypeToVietnamese(gameTypeFilter)}
          </Text>
          <View style={{ width: 48 }} />
        </View>

        <View className="flex-row items-center justify-between mb-4 mr-5">
          <View className="flex-1 mr-2"></View>
          <Button
            icon={<Icon name="filter" type="feather" color="white" />}
            buttonStyle={{ backgroundColor: "black", borderRadius: 10 }}
            onPress={() => setFilterVisible(!filterVisible)}
          />
        </View>

        {isLoading ? (
          <LoadingPage />
        ) : (
          <FlatList
            data={chessTables}
            keyExtractor={(item, index) =>
              `${item.tableId}-${item.startDate}-${item.endDate}-${index}`
            }
            renderItem={({ item }) => (
              <TableCard
                table={item}
                isSelected={selectedTables.some(
                  (t: any) =>
                    t.tableId === item.tableId &&
                    t.startDate === item.startDate &&
                    t.endDate === item.endDate,
                )}
                onPress={() => handleToggleTable(item)}
              />
            )}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.2}
            ListFooterComponent={
              isFetchingMore ? (
                <ActivityIndicator
                  size="small"
                  color="#3B82F6"
                  className="my-4"
                />
              ) : null
            }
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        )}

        {selectedTables.length > 0 && (
          <Animated.View
            style={{
              position: "absolute",
              bottom: 0,
              left: 20,
              right: 20,
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
                  backgroundColor: "#EF4444", // error color
                  borderRadius: 10,
                  paddingVertical: 10,
                }}
                titleStyle={{ fontWeight: "bold", fontSize: 16 }}
              />
              <Button
                title={`Chọn ${selectedTables.length} bàn`}
                onPress={() => navigation.navigate("booking_detail")}
                buttonStyle={{
                  backgroundColor: "#3B82F6", // primary color
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
      {filterVisible && (
        <BottomSheetFilterTable
          gameType={gameTypeFilter}
          roomTypes={roomType}
          onApplyFilter={(gameTypes, roomTypes, startDate, endDate) => {
            setGameTypeFilter(gameTypes);
            setRoomTypes(roomTypes);
            setStartDateFilter(startDate);
            setEndDateFilter(endDate);
            setPageNumber(1);
            fetchTables(gameTypes, roomTypes, startDate, endDate, 1);
          }}
          onClose={() => setFilterVisible(false)}
        />
      )}
    </SafeAreaView>
  );
}

function AppointmentLayout() {
  const navigation = useNavigation();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F9FAFB" /* neutral-50 */ }}
    >
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
              color: "#111827" /* neutral-900 */,
            }}
          >
            Lịch hẹn
          </Text>
          <View style={{ width: 48 }} />
        </View>

        {/* Nội dung màn hình */}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
