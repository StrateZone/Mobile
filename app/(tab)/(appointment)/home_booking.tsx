import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Button, CheckBox, Icon } from "@rneui/themed";
import RNDateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../../constants/types/root-stack";
import { ScrollView } from "react-native-gesture-handler";
import { getRequest } from "@/helpers/api-requests";

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BookingFormScreen() {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  const minStartTime = new Date(now);
  minStartTime.setHours(now.getHours() + 1);

  const gameTypeMap: { [key: string]: string } = {
    "Cờ vua": "chess",
    "Cờ tướng": "xiangqi",
    "Cờ vây": "go",
  };

  const roomTypeMap: { [key: string]: string } = {
    "Phòng cơ bản": "basic",
    "Phòng không gian mở": "openspaced",
    "Phòng cao cấp": "premium",
  };

  const navigation = useNavigation<NavigationProp>();
  const [gameType, setGameType] = useState<string>("Cờ vua");
  const [roomType, setRoomTypes] = useState<string[]>(["Phòng cơ bản"]);
  const [selectedDate, setSelectedDate] = useState<Date>(now);
  const [startTime, setStartTime] = useState<Date>(now);
  const [endTime, setEndTime] = useState<Date>(now);
  const [openHour, setOpenHour] = useState<string>("");
  const [closeHour, setCloseHour] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const formatDateForApi = (date: Date | null) =>
    date ? date.toISOString().split("T")[0] : null;

  useEffect(() => {
    const fetchBusinessHours = async () => {
      const formatDate = formatDateForApi(selectedDate);
      try {
        const [openResponse, closeResponse] = await Promise.all([
          getRequest(`/system/1/open-hour/date`, { date: formatDate }),
          getRequest(`/system/1/close-hour/date`, { date: formatDate }),
        ]);

        const openData = await openResponse;
        const closeData = await closeResponse;
        setOpenHour(openData);
        setCloseHour(closeData);
      } catch (error) {
        console.error("Error fetching business hours:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinessHours();
  }, []);

  const getHourFromTimeString = (timeString: string): number => {
    return parseInt(timeString.split(":")[0]);
  };

  const handleSelectGameType = (game: string) => {
    setGameType(game);
  };

  const toggleRoomType = (room: string) => {
    setRoomTypes((prev) =>
      prev.includes(room) ? prev.filter((r) => r !== room) : [...prev, room],
    );
  };

  const convertToUTC7 = (date: Date): Date => {
    const utc7Date = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    return utc7Date;
  };

  const validateAndNavigate = () => {
    const selectedDateUTC7 = convertToUTC7(selectedDate);
    const startTimeUTC7 = convertToUTC7(startTime);
    const endTimeUTC7 = convertToUTC7(endTime);
    const nowUTC7 = new Date();

    const startHour = startTimeUTC7.getUTCHours();
    const endHour = endTimeUTC7.getUTCHours();
    const nowHour = nowUTC7.getHours();
    const earliestHour = getHourFromTimeString(openHour);
    const latestHour = getHourFromTimeString(closeHour);
    const minStartHour = nowHour + 1;

    const isToday =
      selectedDateUTC7.toISOString().split("T")[0] ===
      nowUTC7.toISOString().split("T")[0];

    if (startHour < earliestHour || startHour > latestHour) {
      Alert.alert(
        "Lỗi",
        `Giờ bắt đầu phải từ ${openHour} giờ sáng đến ${closeHour} giờ!`,
      );
      return;
    }

    if (isToday && startHour < minStartHour) {
      Alert.alert("Lỗi", "Giờ bắt đầu phải sau giờ hiện tại ít nhất 1 giờ!");
      return;
    }

    if (endHour <= startHour) {
      Alert.alert("Lỗi", "Giờ kết thúc phải sau giờ bắt đầu!");
      return;
    }

    if (endHour > latestHour) {
      Alert.alert("Lỗi", `Giờ kết thúc không được sau ${closeHour} giờ!`);
      return;
    }

    if (roomType.length === 0) {
      Alert.alert("Lỗi", "Bạn phải chọn ít nhất một loại phòng!");
      return;
    }

    const formatDate = (date: Date) => date.toISOString().split("T")[0];
    const formatTime = (date: Date) =>
      date.toISOString().split("T")[1].split(".")[0];

    navigation.navigate("list_table", {
      gameType,
      roomTypes: roomType,
      selectedDate: formatDate(selectedDateUTC7),
      StartTime: formatTime(startTimeUTC7),
      EndTime: formatTime(endTimeUTC7),
    });
  };

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

  return (
    <ScrollView className="flex-1 bg-white p-6">
      {isLoading ? (
        <Text className="text-center text-gray-500 font-semibold mb-4">
          Đang tải thông tin giờ mở cửa...
        </Text>
      ) : (
        <Text className="text-center text-red-500 font-semibold mb-4">
          ⏰ Hệ thống chỉ nhận đặt bàn từ {openHour} giờ đến {closeHour} giờ{" "}
          {"\n"}
          Nếu giờ đặt bàn đã qua, vui lòng chọn giờ gần nhất hoặc chọn ngày tiếp
          theo.
        </Text>
      )}
      <Text className="text-lg font-semibold text-black mb-2">
        Chọn loại cờ:
      </Text>
      <Text className="text-gray-500 mb-2">
        Bạn chỉ có thể chọn <Text className="font-semibold">một</Text> loại cờ.
      </Text>
      <View className="mb-4">
        {Object.keys(gameTypeMap).map((game) => (
          <CheckBox
            key={game}
            title={game}
            checked={gameType === game}
            onPress={() => handleSelectGameType(game)}
            containerStyle={{
              backgroundColor: gameType === game ? "#dbeafe" : "white",
              borderRadius: 10,
              paddingVertical: 8,
            }}
            checkedColor="blue"
          />
        ))}
      </View>

      <Text className="text-lg font-semibold text-black mb-2">
        Chọn loại phòng:
      </Text>
      <Text className="text-gray-500 mb-2">
        Bạn có thể chọn <Text className="font-semibold">nhiều</Text> loại phòng
        cùng lúc.
      </Text>
      <View className="mb-4">
        {Object.keys(roomTypeMap).map((room) => (
          <CheckBox
            key={room}
            title={room}
            checked={roomType.includes(room)}
            onPress={() => toggleRoomType(room)}
            containerStyle={{
              backgroundColor: roomType.includes(room) ? "#ecfccb" : "white",
              borderRadius: 10,
              paddingVertical: 8,
            }}
            checkedColor="green"
          />
        ))}
      </View>

      <View className="flex-row">
        <Text className="text-lg font-semibold text-black mb-2">
          Chọn ngày:
        </Text>
        <RNDateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          minimumDate={new Date()}
          display="default"
          locale="vi-VN"
          onChange={(event, date) => {
            if (date) setSelectedDate(date);
          }}
          style={{ flex: 1 }}
        />
      </View>

      <Text className="text-lg font-semibold text-black mt-4 mb-2">
        Chọn giờ:
      </Text>
      <View className="flex-row items-center justify-between border border-gray-200 p-4 rounded-xl bg-white shadow-sm">
        <RNDateTimePicker
          value={startTime}
          minuteInterval={30}
          mode="time"
          display="default"
          onChange={handleStartTimeChange}
        />
        <Text className="mx-3 text-lg font-semibold text-gray-500">→</Text>
        <RNDateTimePicker
          value={endTime}
          minuteInterval={30}
          mode="time"
          display="default"
          onChange={handleEndTimeChange}
        />
      </View>

      <Button
        title="Tìm bàn"
        buttonStyle={{
          backgroundColor: "black",
          borderRadius: 10,
          paddingVertical: 12,
          marginTop: 20,
        }}
        titleStyle={{ color: "white", fontWeight: "bold", fontSize: 16 }}
        icon={<Icon name="search" type="feather" color="white" size={20} />}
        onPress={validateAndNavigate}
      />
    </ScrollView>
  );
}
