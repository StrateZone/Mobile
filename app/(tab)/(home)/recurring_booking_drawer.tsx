import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { BottomSheet, Button, Input, Divider } from "@rneui/themed";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialIcons } from "@expo/vector-icons";

type RecurringBookingDrawerProps = {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (data: RecurringBookingFormData) => void;
};

export type RecurringBookingFormData = {
  year: number;
  month: number;
  dayOfWeek: number;
  startTime: Date;
  endTime: Date;
  roomType: string;
  gameType: string;
};

const DAYS_OF_WEEK = [
  { label: "Chủ nhật", value: 0 },
  { label: "Thứ 2", value: 1 },
  { label: "Thứ 3", value: 2 },
  { label: "Thứ 4", value: 3 },
  { label: "Thứ 5", value: 4 },
  { label: "Thứ 6", value: 5 },
  { label: "Thứ 7", value: 6 },
];

const ROOM_TYPES = [
  { label: "Phòng thường", value: "normal" },
  { label: "Phòng VIP", value: "vip" },
  { label: "Phòng cao cấp", value: "premium" },
];

const GAME_TYPES = [
  { label: "Cờ vua", value: "chess" },
  { label: "Cờ tướng", value: "chinese_chess" },
];

export default function RecurringBookingDrawer({
  isVisible,
  onClose,
  onSubmit,
}: RecurringBookingDrawerProps) {
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState<RecurringBookingFormData>({
    year: currentYear,
    month: new Date().getMonth() + 1,
    dayOfWeek: new Date().getDay(),
    startTime: new Date(),
    endTime: new Date(new Date().setHours(new Date().getHours() + 1)),
    roomType: "normal",
    gameType: "chess",
  });

  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  return (
    <BottomSheet isVisible={isVisible} onBackdropPress={onClose}>
      <View className="bg-white rounded-t-xl p-4 h-[90%]">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-semibold text-gray-800">
            Đặt bàn định kỳ
          </Text>
          <MaterialIcons
            name="close"
            size={24}
            color="#6B7280"
            onPress={onClose}
          />
        </View>

        <ScrollView className="flex-1">
          <View className="space-y-4">
            {/* Year Input */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Năm
              </Text>
              <Picker
                selectedValue={formData.year}
                onValueChange={(value) =>
                  setFormData({ ...formData, year: value })
                }
                style={{ backgroundColor: "#F3F4F6" }}
              >
                {Array.from({ length: 5 }, (_, i) => currentYear + i).map(
                  (year) => (
                    <Picker.Item
                      key={year}
                      label={year.toString()}
                      value={year}
                    />
                  )
                )}
              </Picker>
            </View>

            {/* Month Input */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Tháng
              </Text>
              <Picker
                selectedValue={formData.month}
                onValueChange={(value) =>
                  setFormData({ ...formData, month: value })
                }
                style={{ backgroundColor: "#F3F4F6" }}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <Picker.Item
                    key={month}
                    label={month.toString()}
                    value={month}
                  />
                ))}
              </Picker>
            </View>

            {/* Day of Week Input */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Ngày trong tuần
              </Text>
              <Picker
                selectedValue={formData.dayOfWeek}
                onValueChange={(value) =>
                  setFormData({ ...formData, dayOfWeek: value })
                }
                style={{ backgroundColor: "#F3F4F6" }}
              >
                {DAYS_OF_WEEK.map((day) => (
                  <Picker.Item
                    key={day.value}
                    label={day.label}
                    value={day.value}
                  />
                ))}
              </Picker>
            </View>

            <Divider />

            {/* Time Inputs */}
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  Giờ bắt đầu
                </Text>
                <Button
                  title={formData.startTime.toLocaleTimeString()}
                  onPress={() => setShowStartTimePicker(true)}
                  type="outline"
                  buttonStyle={{ borderColor: "#D1D5DB" }}
                  titleStyle={{ color: "#374151" }}
                />
                {showStartTimePicker && (
                  <DateTimePicker
                    value={formData.startTime}
                    mode="time"
                    is24Hour={true}
                    onChange={(event, selectedDate) => {
                      setShowStartTimePicker(false);
                      if (selectedDate) {
                        setFormData({ ...formData, startTime: selectedDate });
                      }
                    }}
                  />
                )}
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  Giờ kết thúc
                </Text>
                <Button
                  title={formData.endTime.toLocaleTimeString()}
                  onPress={() => setShowEndTimePicker(true)}
                  type="outline"
                  buttonStyle={{ borderColor: "#D1D5DB" }}
                  titleStyle={{ color: "#374151" }}
                />
                {showEndTimePicker && (
                  <DateTimePicker
                    value={formData.endTime}
                    mode="time"
                    is24Hour={true}
                    onChange={(event, selectedDate) => {
                      setShowEndTimePicker(false);
                      if (selectedDate) {
                        setFormData({ ...formData, endTime: selectedDate });
                      }
                    }}
                  />
                )}
              </View>
            </View>

            <Divider />

            {/* Room Type Input */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Loại phòng
              </Text>
              <Picker
                selectedValue={formData.roomType}
                onValueChange={(value) =>
                  setFormData({ ...formData, roomType: value })
                }
                style={{ backgroundColor: "#F3F4F6" }}
              >
                {ROOM_TYPES.map((type) => (
                  <Picker.Item
                    key={type.value}
                    label={type.label}
                    value={type.value}
                  />
                ))}
              </Picker>
            </View>

            {/* Game Type Input */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Loại trò chơi
              </Text>
              <Picker
                selectedValue={formData.gameType}
                onValueChange={(value) =>
                  setFormData({ ...formData, gameType: value })
                }
                style={{ backgroundColor: "#F3F4F6" }}
              >
                {GAME_TYPES.map((type) => (
                  <Picker.Item
                    key={type.value}
                    label={type.label}
                    value={type.value}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </ScrollView>

        <View className="pt-4">
          <Button
            title="Xác nhận đặt bàn"
            onPress={handleSubmit}
            buttonStyle={{
              backgroundColor: "#10B981",
              borderRadius: 8,
              paddingVertical: 12,
            }}
            titleStyle={{ fontSize: 16, fontWeight: "600" }}
          />
        </View>
      </View>
    </BottomSheet>
  );
}
