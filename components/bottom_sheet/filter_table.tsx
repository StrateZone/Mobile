import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Button, CheckBox } from "@rneui/themed";
import DateTimePicker from "@react-native-community/datetimepicker";
import { GestureHandlerRootView } from "react-native-gesture-handler";

type Props = {
  onApplyFilter: (
    gameType: string,
    roomTypes: string[],
    startDate: Date,
    endDate: Date,
  ) => void;
  onClose: () => void;
};

export default function BottomSheetFilterTable({
  onApplyFilter,
  onClose,
}: Props) {
  const sheetRef = useRef<BottomSheet>(null);

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

  const [selectedGameType, setSelectedGameType] = useState<string>("Cờ vua");
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<string[]>([
    "Phòng cơ bản",
  ]);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());

  const handleSelectGameType = (game: string) => {
    setSelectedGameType(game);
  };

  const toggleRoomType = (room: string) => {
    setSelectedRoomTypes((prev) =>
      prev.includes(room) ? prev.filter((r) => r !== room) : [...prev, room],
    );
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    if (selectedTime) {
      setStartDate(
        new Date(
          startDate.setHours(
            selectedTime.getHours(),
            selectedTime.getMinutes(),
            0,
            0,
          ),
        ),
      );
    }
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    if (selectedTime) {
      setEndDate(
        new Date(
          endDate.setHours(
            selectedTime.getHours(),
            selectedTime.getMinutes(),
            0,
            0,
          ),
        ),
      );
    }
  };

  const applyFilters = () => {
    const mappedGameType = gameTypeMap[selectedGameType]; 
    const mappedRoomTypes = selectedRoomTypes.map((room) => roomTypeMap[room]);

    console.log("Filtered values:", {
      gameType: mappedGameType,
      roomTypes: mappedRoomTypes,
      startDate,
      endDate,
    });

    onApplyFilter(mappedGameType, mappedRoomTypes, startDate, endDate);
    onClose();
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <BottomSheet ref={sheetRef} index={0}>
        <BottomSheetScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.content}>
            <Text style={styles.title}>Bộ Lọc</Text>

            {/* Chọn loại cờ */}
            <Text style={styles.label}>Loại cờ:</Text>
            {Object.keys(gameTypeMap).map((game) => (
              <CheckBox
                key={game}
                title={game}
                checked={selectedGameType === game}
                onPress={() => handleSelectGameType(game)}
              />
            ))}

            {/* Chọn ngày */}
            <Text style={styles.label}>Ngày:</Text>
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={(event, date) => date && setStartDate(date)}
              />
              <Text style={styles.centerText}>Đến</Text>
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={(event, date) => date && setEndDate(date)}
              />
            </View>

            {/* Chọn giờ */}
            <Text style={styles.label}>Giờ:</Text>
            <View style={styles.timePickerContainer}>
              <DateTimePicker
                value={startDate}
                mode="time"
                display="default"
                onChange={handleStartTimeChange}
              />
              <DateTimePicker
                value={endDate}
                mode="time"
                display="default"
                onChange={handleEndTimeChange}
              />
            </View>

            {/* Chọn loại phòng */}
            <Text style={styles.label}>Loại phòng:</Text>
            {Object.keys(roomTypeMap).map((room) => (
              <CheckBox
                key={room}
                title={room}
                checked={selectedRoomTypes.includes(room)}
                onPress={() => toggleRoomType(room)}
              />
            ))}

            {/* Nút áp dụng */}
            <Button
              title="Áp dụng"
              onPress={applyFilters}
              buttonStyle={styles.applyButton}
            />

            {/* Nút đóng */}
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
  datePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  timePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  centerText: { textAlign: "center", fontSize: 16 },
  applyButton: { backgroundColor: "black", borderRadius: 10, marginTop: 15 },
  closeButton: {
    textAlign: "center",
    color: "red",
    fontWeight: "bold",
    marginTop: 10,
  },
});
