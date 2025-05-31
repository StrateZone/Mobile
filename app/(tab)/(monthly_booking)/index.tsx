import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/constants/types/root-stack";

import { Button, CheckBox } from "@rneui/themed";
import RNDateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import BackButton from "@/components/BackButton";
import { getRequest } from "@/helpers/api-requests";
import { GameType } from "@/constants/types/game_type";
import { RoomType } from "@/constants/types/room_type";
import { useAuth } from "@/context/auth-context";
import LoadingPage from "@/components/loading/loading_page";
import { capitalizeWords } from "@/helpers/capitalize_first_letter";

const DAYS_OF_WEEK = [
  { label: "Thứ 2", value: "Monday" },
  { label: "Thứ 3", value: "Tuesday" },
  { label: "Thứ 4", value: "Wednesday" },
  { label: "Thứ 5", value: "Thursday" },
  { label: "Thứ 6", value: "Friday" },
  { label: "Thứ 7", value: "Saturday" },
  { label: "Chủ nhật", value: "Sunday" },
];

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "list_table_monthly"
>;

export default function MonthlyBookingScreen() {
  const navigation = useNavigation<NavigationProp>();

  const now = new Date();
  now.setMinutes(0, 0, 0);
  const minStartTime = new Date(now);
  minStartTime.setHours(now.getHours() + 1);

  const { authState } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [gameTypeList, setGameTypeList] = useState<any[]>([]);
  const [gameType, setGameType] = useState<string>("");
  const [roomTypeList, setRoomTypeList] = useState<any[]>([]);
  const [roomType, setRoomTypes] = useState<string>("");
  const [fromDate, setFromDate] = useState<Date>(now);
  const [toDate, setToDate] = useState<Date>(now);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<Date>(now);
  const [endTime, setEndTime] = useState<Date>(now);

  const fetchGameType = async () => {
    try {
      const response = await getRequest("/game_types/all");
      if (response.length > 0) {
        setGameTypeList(response);
        setGameType(response[0].typeName);
      }
    } catch (error) {
      console.error("Error fetching game types", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoomType = async () => {
    try {
      const response = await getRequest("/rooms/roomtypes/for-monthly-booking");
      if (response.length > 0) {
        setRoomTypeList(response);
        setRoomTypes(response[0]);
      }
    } catch (error) {
      console.error("Error fetching room types", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGameType();
    fetchRoomType();
  }, []);

  const handleStartTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    if (date) {
      setStartTime(date);
    }
  };

  const handleEndTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    if (date) {
      setEndTime(date);
    }
  };

  const handleFromDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (date) {
      setFromDate(date);
    }
  };

  const handleToDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (date) {
      setToDate(date);
    }
  };

  const handleSelectGameType = (game: string) => {
    setGameType(game);
  };

  const handleSelectRoomType = (room: string) => {
    setRoomTypes(room);
  };

  const toggleDaySelection = (day: string) => {
    setSelectedDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  const convertToUTC7 = (date: Date): Date => {
    const utc7Date = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    return utc7Date;
  };

  const validateAndNavigate = () => {
    const fromDateUTC7 = convertToUTC7(fromDate);
    const toDateUTC7 = convertToUTC7(toDate);
    const startTimeUTC7 = convertToUTC7(startTime);
    const endTimeUTC7 = convertToUTC7(endTime);
    const nowUTC7 = convertToUTC7(new Date());

    // Kiểm tra ngày bắt đầu phải lớn hơn ngày hiện tại
    if (fromDateUTC7 < nowUTC7) {
      Alert.alert("Lỗi", "Ngày bắt đầu phải sau ngày hiện tại");
      return;
    }

    // Kiểm tra ngày kết thúc phải sau ngày bắt đầu
    if (toDateUTC7 <= fromDateUTC7) {
      Alert.alert("Lỗi", "Ngày kết thúc phải sau ngày bắt đầu");
      return;
    }

    // Kiểm tra thời gian kết thúc phải sau thời gian bắt đầu
    if (endTimeUTC7 <= startTimeUTC7) {
      Alert.alert("Lỗi", "Thời gian kết thúc phải sau thời gian bắt đầu");
      return;
    }

    // Kiểm tra phải chọn ít nhất một thứ trong tuần
    if (selectedDays.length === 0) {
      Alert.alert("Lỗi", "Bạn phải chọn ít nhất một thứ trong tuần");
      return;
    }

    if (roomType.length === 0) {
      Alert.alert("Lỗi", "Bạn phải chọn ít nhất một loại phòng!");
      return;
    }

    const formatDate = (date: Date) => date.toISOString().split("T")[0];
    const formatTime = (date: Date) =>
      date.toISOString().split("T")[1].split(".")[0];

    // Navigate to ListTableScreen with form data
    navigation.navigate("list_table_monthly", {
      fromDate: formatDate(fromDateUTC7),
      toDate: formatDate(toDateUTC7),
      daysOfWeek: selectedDays,
      StartTime: formatTime(startTimeUTC7),
      EndTime: formatTime(endTimeUTC7),
      gameType,
      roomTypes: roomType,
    });
  };

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <LoadingPage />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1">
          <View className="p-4 space-y-6">
            {/* Date Selection */}
            <View className="space-y-4">
              <Text className="text-lg font-semibold text-black">
                Chọn khoảng thời gian:
              </Text>

              {/* Date Selection */}
              <View className="space-y-2">
                <Text className="text-sm text-gray-600">Chọn ngày</Text>
                <View className="flex-row items-center justify-between bg-gray-50 rounded-lg border border-gray-200 p-3">
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 mb-1">Từ ngày</Text>
                    <View className="flex-row items-center">
                      <RNDateTimePicker
                        value={fromDate}
                        mode="date"
                        display="default"
                        onChange={handleFromDateChange}
                        minimumDate={new Date()}
                        themeVariant="light"
                        locale="vi"
                        style={{ width: 120 }}
                      />
                    </View>
                  </View>

                  <View className="h-8 w-px bg-gray-300 mx-2" />

                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 mb-1">Đến ngày</Text>
                    <View className="flex-row items-center">
                      <RNDateTimePicker
                        value={toDate}
                        mode="date"
                        display="default"
                        onChange={handleToDateChange}
                        minimumDate={fromDate}
                        themeVariant="light"
                        locale="vi"
                        style={{ width: 120 }}
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* Time Selection */}
              <View className="space-y-2">
                <Text className="text-sm text-gray-600">Chọn giờ</Text>
                <View className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-xs text-gray-500 mb-1">Từ giờ</Text>
                      <View className="flex-row items-center">
                        <RNDateTimePicker
                          value={startTime}
                          minuteInterval={30}
                          mode="time"
                          display="default"
                          onChange={handleStartTimeChange}
                          locale="vi"
                          style={{ width: 85 }}
                        />
                      </View>
                    </View>

                    <View className="h-8 w-px bg-gray-300 mx-2" />

                    <View className="flex-1">
                      <Text className="text-xs text-gray-500 mb-1">
                        Đến giờ
                      </Text>
                      <View className="flex-row items-center">
                        <RNDateTimePicker
                          value={endTime}
                          minuteInterval={30}
                          mode="time"
                          display="default"
                          onChange={handleEndTimeChange}
                          locale="vi"
                          style={{ width: 85 }}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Days of Week Selection */}
              <View>
                <Text className="text-base text-gray-600 mb-2">
                  Chọn thứ trong tuần
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <TouchableOpacity
                      key={day.value}
                      onPress={() => toggleDaySelection(day.value)}
                      className={`px-4 py-2 rounded-full ${
                        selectedDays.includes(day.value)
                          ? "bg-blue-500"
                          : "bg-gray-100"
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          selectedDays.includes(day.value)
                            ? "text-white"
                            : "text-gray-600"
                        }`}
                      >
                        {day.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Game Type Selection */}
            <View className="space-y-2">
              <Text className="text-base font-medium text-gray-700">
                Loại cờ
              </Text>
              <View className="mb-4">
                {gameTypeList.map((game: any) => (
                  <CheckBox
                    key={game.typeName}
                    title={capitalizeWords(game.typeName)}
                    checked={gameType === game.typeName}
                    onPress={() => handleSelectGameType(game.typeName)}
                    containerStyle={{
                      backgroundColor:
                        gameType === game.typeName ? "#dbeafe" : "white",
                      borderRadius: 10,
                      paddingVertical: 8,
                    }}
                    checkedColor="blue"
                  />
                ))}
              </View>
            </View>

            {/* Room Type Selection */}
            <View className="space-y-2">
              <Text className="text-base font-medium text-gray-700">
                Loại phòng
              </Text>
              <View className="mb-4">
                {roomTypeList.map((room) => (
                  <CheckBox
                    key={room}
                    title={capitalizeWords(room)}
                    checked={roomType === room}
                    onPress={() => handleSelectRoomType(room)}
                    containerStyle={{
                      backgroundColor: roomType === room ? "#ecfccb" : "white",
                      borderRadius: 10,
                      paddingVertical: 8,
                    }}
                    checkedColor="green"
                  />
                ))}
              </View>
            </View>

            {/* Submit Button */}
            <Button
              title="Tìm bàn"
              onPress={validateAndNavigate}
              buttonStyle={{
                backgroundColor: "#10B981",
                borderRadius: 8,
                paddingVertical: 12,
              }}
              titleStyle={{ fontSize: 16, fontWeight: "600" }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
