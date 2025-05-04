// BottomSheetSortAppointment.tsx
import React, { useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Button, CheckBox } from "@rneui/themed";
import { GestureHandlerRootView } from "react-native-gesture-handler";

type Props = {
  selectedSort: string;
  onSelectSort: (sortBy: string) => void;
  onClose: () => void;
};

export default function BottomSheetSortAppointment({
  selectedSort,
  onSelectSort,
  onClose,
}: Props) {
  const sheetRef = useRef<BottomSheet>(null);

  const sortOptions = [
    { label: "Mới nhất", value: "created-at-desc" },
    { label: "Cũ nhất", value: "created-at" },
    { label: "Giá cao nhất", value: "total-price-desc" },
    { label: "Giá thấp nhất", value: "total-price" },
  ];

  return (
    <GestureHandlerRootView style={styles.container}>
      <BottomSheet ref={sheetRef} index={0}>
        <BottomSheetScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.content}>
            <Text style={styles.title}>Sắp xếp theo</Text>

            {sortOptions.map((option) => (
              <CheckBox
                key={option.value}
                title={option.label}
                checked={selectedSort === option.value}
                onPress={() => {
                  onSelectSort(option.value);
                  onClose();
                }}
              />
            ))}
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
  applyButton: { backgroundColor: "black", borderRadius: 10, marginTop: 15 },
  closeButton: {
    textAlign: "center",
    color: "red",
    fontWeight: "bold",
    marginTop: 10,
  },
});
