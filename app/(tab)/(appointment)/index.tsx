import { View, Text, StyleSheet } from "react-native";

export default function AppointmentScreen() {
  return (
    <View style={styles.container}>
      <Text className="text-2xl">Đặt bàn</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
