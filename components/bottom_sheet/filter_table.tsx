import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Button, CheckBox } from "@rneui/themed";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import RNDateTimePicker from "@react-native-community/datetimepicker";

import { mapGameTypeToVietnamese } from "@/helpers/map_game_type_by_language";
import { mapRoomTypesToVietnamese } from "@/helpers/map_room_type_by_language";
import { getRequest } from "@/helpers/api-requests";
import { capitalizeWords } from "@/helpers/capitalize_first_letter";

type Props = {
  gameType: string;
  roomTypes: string[];

  onApplyFilter: (
    gameType: string,
    roomTypes: string[],
    startDate: Date,
    endDate: Date,
  ) => void;

  onClose: () => void;
};

export default function BottomSheetFilterTable({
  gameType,
  roomTypes,
  onApplyFilter,
  onClose,
}: Props) {
  const sheetRef = useRef<BottomSheet>(null);

  const now = new Date();
  now.setMinutes(0, 0, 0);
  const minStartTime = new Date(now);
  minStartTime.setHours(now.getHours() + 1);

  const [gameTypeList, setGameTypeList] = useState<any[]>([]);
  const [roomTypeList, setRoomTypeList] = useState<string[]>([]);

  useEffect(() => {
    const fetchGameType = async () => {
      try {
        const response = await getRequest("/game_types/all");
        if (response.length > 0) {
          setGameTypeList(response);
          setSelectedGameType(
            response.find((item) => item.typeName === gameType)?.typeName ||
              response[0].typeName,
          );
        }
      } catch (error) {
        console.error("Error fetching game types", error);
      }
    };

    const fetchRoomType = async () => {
      try {
        const response = await getRequest("/rooms/roomtypes");
        if (response.length > 0) {
          setRoomTypeList(response);
          const defaultRoomTypes = response.filter((item: string) =>
            roomTypes.includes(item),
          );
          setSelectedRoomTypes(defaultRoomTypes);
        }
      } catch (error) {
        console.error("Error fetching room types", error);
      }
    };

    fetchGameType();
    fetchRoomType();
  }, []);

  const [selectedGameType, setSelectedGameType] = useState<string>(gameType);
  const [selectedRoomTypes, setSelectedRoomTypes] =
    useState<string[]>(roomTypes);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<Date>(now);
  const [endTime, setEndTime] = useState<Date>(now);
  const [openHour, setOpenHour] = useState<string>("");
  const [closeHour, setCloseHour] = useState<string>("");

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
      }
    };

    fetchBusinessHours();
  }, []);

  const getHourFromTimeString = (timeString: string): number => {
    return parseInt(timeString.split(":")[0]);
  };

  const handleSelectGameType = (game: string) => {
    setSelectedGameType(game);
  };

  const toggleRoomType = (room: string) => {
    setSelectedRoomTypes((prev) =>
      prev.includes(room) ? prev.filter((r) => r !== room) : [...prev, room],
    );
  };

  const convertToUTC7 = (date: Date): Date => {
    const utc7Date = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    return utc7Date;
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

  const applyFilters = () => {
    const selectedDateUTC7 = convertToUTC7(selectedDate);
    const startTimeUTC7 = convertToUTC7(startTime);
    const endTimeUTC7 = convertToUTC7(endTime);
    const nowUTC7 = new Date();

    const formatDate = (date: Date) => date.toISOString().split("T")[0];

    const selectedDateObj = new Date(formatDate(selectedDateUTC7));

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
    if (endHour > latestHour) {
      Alert.alert("Lỗi", "Giờ kết thúc không được sau 22:00!");
      return;
    }

    const formatTime = (date: Date) =>
      date.toISOString().split("T")[1].split(".")[0];

    const createDateTime = (date: Date, time: string) => {
      const [hours, minutes] = time.split(":").map(Number);
      const newDate = new Date(date);
      newDate.setUTCHours(hours, minutes, 0, 0);
      return newDate;
    };

    onApplyFilter(
      selectedGameType,
      selectedRoomTypes,
      createDateTime(selectedDateObj, formatTime(startTimeUTC7)),
      createDateTime(selectedDateObj, formatTime(endTimeUTC7)),
    ),
      onClose();
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <BottomSheet ref={sheetRef} index={0}>
        <BottomSheetScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.content}>
            <Text style={styles.title}>Bộ Lọc</Text>

            <Text style={styles.label}>Loại cờ:</Text>
            {gameTypeList.map((game) => (
              <CheckBox
                key={game.typeName}
                title={capitalizeWords(game.typeName)}
                checked={selectedGameType === game.typeName}
                onPress={() => handleSelectGameType(game.typeName)}
              />
            ))}

            <Text style={styles.label}>Ngày:</Text>
            <RNDateTimePicker
              value={selectedDate || new Date()}
              mode="date"
              minimumDate={new Date()}
              display="default"
              onChange={(event, date) => {
                if (date) setSelectedDate(date);
              }}
            />

            <Text style={styles.label}>Giờ:</Text>
            <View style={styles.timePickerContainer}>
              <RNDateTimePicker
                value={startTime}
                minuteInterval={30}
                mode="time"
                display="default"
                onChange={handleStartTimeChange}
              />
              <RNDateTimePicker
                value={endTime}
                minuteInterval={30}
                mode="time"
                display="default"
                onChange={handleEndTimeChange}
              />
            </View>

            <Text style={styles.label}>Loại phòng:</Text>
            {roomTypeList.map((room) => (
              <CheckBox
                key={room}
                title={capitalizeWords(room)}
                checked={selectedRoomTypes.includes(room)}
                onPress={() => toggleRoomType(room)}
              />
            ))}

            <Button
              title="Áp dụng"
              onPress={applyFilters}
              buttonStyle={styles.applyButton}
            />
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 20, alignItems: "center" },
  content: {
    width: "100%",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  timePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  applyButton: { backgroundColor: "black", borderRadius: 10, marginTop: 15 },
  closeButton: {
    textAlign: "center",
    color: "red",
    fontWeight: "bold",
    marginTop: 10,
  },
});
