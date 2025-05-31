import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getRequest } from "@/helpers/api-requests";
import BackButton from "@/components/BackButton";
import { RootStackParamList } from "@/constants/types/root-stack";
import { capitalizeWords } from "@/helpers/capitalize_first_letter";
import { MonthlyTableContext } from "@/context/select-monthly-table";
import Toast from "react-native-toast-message";
import { Button } from "@rneui/themed";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type ListTableScreenRouteProp = RouteProp<
  RootStackParamList,
  "list_table_monthly"
>;

type GameType = {
  typeId: number;
  typeName: string;
  status: string;
};

type TableResponse = {
  tableId: number;
  roomId: number;
  roomName: string;
  roomType: string;
  roomDescription: string;
  gameTypeId: number;
  gameType: GameType;
  startDate: string;
  endDate: string;
  gameTypePrice: number;
  roomTypePrice: number;
  durationInHours: number;
  totalPrice: number;
};

type TableBooking = {
  dayOfWeek: number;
  onDate: string;
  tableResponse: TableResponse;
};

type MonthlyBookingData = {
  expectedTablesCount: number;
  actualTablesCount: number;
  datesAndTables: {
    [key: string]: TableBooking[];
  };
};

type DayOfWeek =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

const DAYS_OF_WEEK_VI: Record<DayOfWeek, string> = {
  Sunday: "Chủ nhật",
  Monday: "Thứ 2",
  Tuesday: "Thứ 3",
  Wednesday: "Thứ 4",
  Thursday: "Thứ 5",
  Friday: "Thứ 6",
  Saturday: "Thứ 7",
};

export default function ListMonthlyTableScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ListTableScreenRouteProp>();
  const [
    selectedTables,
    toggleTableSelection,
    removeSelectedTable,
    clearSelectedTables,
    clearSelectedTablesWithNoInvite,
  ] = useContext(MonthlyTableContext);
  const {
    fromDate,
    toDate,
    daysOfWeek,
    StartTime,
    EndTime,
    roomTypes,
    gameType,
  } = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [bookingData, setBookingData] = useState<MonthlyBookingData | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchAvailableTables();
  }, []);

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

  const fetchAvailableTables = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getRequest(`/tables/available/monthly`, {
        fromDate,
        toDate,
        daysOfWeek,
        StartTime,
        EndTime,
        roomType: roomTypes,
        gameType,
      });

      if (
        response ===
        "No available table was found for this gametype and roomtype."
      ) {
        setError("Không tìm thấy bàn phù hợp");
        setBookingData(null);
        return;
      }

      setBookingData(response);
    } catch (error) {
      console.error("Error fetching available tables:", error);
      setError("Không thể tải danh sách bàn. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const isTableSelected = (booking: TableBooking) => {
    return selectedTables.some(
      (selectedTable: TableResponse) =>
        selectedTable.tableId === booking.tableResponse.tableId &&
        selectedTable.startDate === booking.tableResponse.startDate &&
        selectedTable.endDate === booking.tableResponse.endDate,
    );
  };

  const handleSelectAllTables = async () => {
    if (!bookingData) return;

    try {
      const allTables = Object.values(bookingData.datesAndTables)
        .flat()
        .map((booking) => booking.tableResponse);

      await clearSelectedTablesWithNoInvite();
      await toggleTableSelection(allTables);

      Toast.show({
        type: "success",
        text1: "Đã chọn tất cả bàn",
      });
    } catch (error) {
      console.error("Error selecting all tables:", error);
      Toast.show({
        type: "error",
        text1: "Có lỗi xảy ra khi chọn bàn",
      });
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0284c7" />
        <Text className="mt-4 text-gray-600">Đang tải danh sách bàn...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1">
          <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-200">
            <BackButton customAction={() => navigation.goBack()} />
            <Text className="text-lg font-semibold text-gray-800">
              Lịch đặt bàn theo tháng
            </Text>
            <View style={{ width: 32 }} />
          </View>
          <View className="flex-1 justify-center items-center p-4">
            <Text className="text-red-500 text-center text-lg mb-4">
              {error}
            </Text>
            <TouchableOpacity
              onPress={fetchAvailableTables}
              className="bg-blue-500 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-medium">Thử lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="flex-1">
        <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-200">
          <BackButton customAction={() => navigation.goBack()} />
          <Text className="text-lg font-semibold text-gray-800">
            Lịch đặt bàn theo tháng
          </Text>
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={handleSelectAllTables}
              className="mr-2 px-3 py-1 bg-blue-100 rounded-lg"
            >
              <Text className="text-sm font-medium text-blue-700">
                Chọn tất cả
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 p-4 mb-20">
          {bookingData && (
            <View className="mb-4">
              <Text className="text-base text-gray-600">
                Tìm thấy {bookingData.actualTablesCount} bàn phù hợp
              </Text>
            </View>
          )}

          {bookingData &&
            Object.entries(bookingData.datesAndTables).map(
              ([dayName, bookings]) => (
                <View
                  key={dayName}
                  className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden"
                >
                  {/* Header cho thứ trong tuần */}
                  <View className="bg-indigo-600 p-4">
                    <Text className="text-xl font-semibold text-white">
                      {DAYS_OF_WEEK_VI[dayName as DayOfWeek]}
                    </Text>
                  </View>

                  {bookings.map((booking, index) => {
                    const isSelected = isTableSelected(booking);
                    return (
                      <View
                        key={`${booking.onDate}-${index}`}
                        className="border-b border-gray-100 last:border-b-0"
                      >
                        {/* Thông tin ngày và giờ */}
                        <View className="bg-indigo-50 p-3">
                          <Text className="text-base font-medium text-indigo-900">
                            {formatDate(booking.onDate)}
                          </Text>
                          <Text className="text-sm text-indigo-700">
                            {formatTime(booking.tableResponse.startDate)} -{" "}
                            {formatTime(booking.tableResponse.endDate)}
                          </Text>
                        </View>

                        <View className="p-4">
                          {/* Card thông tin bàn */}
                          <View className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            {/* Header thông tin bàn */}
                            <View className="bg-blue-50 p-3 border-b border-gray-200">
                              <View className="flex-row justify-between items-center">
                                <Text className="text-lg font-semibold text-blue-900">
                                  Bàn số {booking.tableResponse.tableId}
                                </Text>
                                <Text className="text-base font-medium text-blue-700">
                                  {formatPrice(
                                    booking.tableResponse.totalPrice,
                                  )}
                                </Text>
                              </View>
                            </View>

                            {/* Nội dung thông tin bàn */}
                            <View className="p-3 space-y-3">
                              {/* Thông tin phòng */}
                              <View className="space-y-1">
                                <Text className="text-sm font-medium text-gray-700">
                                  Thông tin phòng:
                                </Text>
                                <View className="ml-3">
                                  <Text className="text-sm text-gray-600">
                                    Phòng {booking.tableResponse.roomName} -{" "}
                                    {booking.tableResponse.roomType}
                                  </Text>
                                  <Text className="text-sm text-gray-500 italic">
                                    {booking.tableResponse.roomDescription}
                                  </Text>
                                  <Text className="text-sm text-emerald-600">
                                    Giá phòng:{" "}
                                    {formatPrice(
                                      booking.tableResponse.roomTypePrice,
                                    )}
                                    /giờ
                                  </Text>
                                </View>
                              </View>

                              {/* Thông tin cờ */}
                              <View className="space-y-1">
                                <Text className="text-sm font-medium text-gray-700">
                                  Thông tin cờ:
                                </Text>
                                <View className="ml-3">
                                  <Text className="text-sm text-gray-600">
                                    Loại:{" "}
                                    {booking.tableResponse.gameType.typeName}
                                  </Text>
                                  <Text className="text-sm text-emerald-600">
                                    Giá cờ:{" "}
                                    {formatPrice(
                                      booking.tableResponse.gameTypePrice,
                                    )}
                                    /giờ
                                  </Text>
                                </View>
                              </View>

                              {/* Chi phí */}
                              <View className="space-y-1">
                                <Text className="text-sm font-medium text-gray-700">
                                  Chi phí (
                                  {booking.tableResponse.durationInHours} giờ):
                                </Text>
                                <View className="ml-3">
                                  <Text className="text-sm text-gray-600">
                                    Phí phòng:{" "}
                                    {formatPrice(
                                      booking.tableResponse.roomTypePrice *
                                        booking.tableResponse.durationInHours,
                                    )}
                                  </Text>
                                  <Text className="text-sm text-gray-600">
                                    Phí cờ:{" "}
                                    {formatPrice(
                                      booking.tableResponse.gameTypePrice *
                                        booking.tableResponse.durationInHours,
                                    )}
                                  </Text>
                                </View>
                              </View>

                              {/* Buttons */}
                              <View className="flex-row justify-end space-x-3 mt-4 pt-3 border-t border-gray-100">
                                <TouchableOpacity
                                  className="px-4 py-2 bg-gray-100 rounded-lg"
                                  onPress={() => {
                                    navigation.navigate(
                                      "table_detail_monthly",
                                      {
                                        tableId: booking.tableResponse.tableId,
                                        startDate:
                                          booking.tableResponse.startDate,
                                        endDate: booking.tableResponse.endDate,
                                      },
                                    );
                                  }}
                                >
                                  <Text className="text-sm font-medium text-gray-700">
                                    Xem chi tiết
                                  </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  className={`px-4 py-2 rounded-lg ${
                                    isSelected ? "bg-gray-200" : "bg-blue-500"
                                  }`}
                                  disabled={isSelected}
                                  onPress={async () => {
                                    try {
                                      await toggleTableSelection([
                                        booking.tableResponse,
                                      ]);
                                      Toast.show({
                                        type: "success",
                                        text1: "Đã thêm bàn vào danh sách",
                                      });
                                    } catch (error) {
                                      console.error(
                                        "Error selecting table:",
                                        error,
                                      );
                                      Toast.show({
                                        type: "error",
                                        text1: "Có lỗi xảy ra khi chọn bàn",
                                      });
                                    }
                                  }}
                                >
                                  <Text
                                    className={`text-sm font-medium ${
                                      isSelected
                                        ? "text-gray-600"
                                        : "text-white"
                                    }`}
                                  >
                                    {isSelected ? "Đã chọn" : "Chọn bàn"}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ),
            )}
        </ScrollView>

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
            <View className="flex-row justify-between p-3 bg-white rounded-lg shadow-lg mb-4">
              <Button
                title="Xóa hết"
                onPress={async () => {
                  await clearSelectedTablesWithNoInvite();
                }}
                buttonStyle={{
                  backgroundColor: "#EF4444",
                  borderRadius: 10,
                  paddingVertical: 10,
                }}
                titleStyle={{ fontWeight: "bold", fontSize: 16 }}
              />
              <Button
                title={`Đặt ${selectedTables.length} bàn`}
                onPress={() => navigation.navigate("booking_detail_monthly")}
                buttonStyle={{
                  backgroundColor: "#3B82F6",
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
    </SafeAreaView>
  );
}
