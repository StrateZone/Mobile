import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { getRequest } from "@/helpers/api-requests";

import { RootStackParamList } from "@/constants/types/root-stack";
import { Apointment, TablesAppointment } from "@/constants/types/apointment";
import { Ionicons } from "@expo/vector-icons";
import { Fold } from "react-native-animated-spinkit";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ListTableRouteProp = RouteProp<RootStackParamList, "appointment_detail">;
type Props = {
  route: ListTableRouteProp;
};

const statusColors: Record<string, string> = {
  pending: "#facc15",
  confirmed: "#10b981",
  incoming: "#0ea5e9",
  completed: "#22c55e",
  expired: "#64748b",
  cancelled: "#6b7280",
  refunded: "#8b5cf6",
  incompleted: "#ef4444",
};

const statusTextMap: Record<string, string> = {
  pending: "Đang chờ thanh toán",
  confirmed: "Đã thanh toán",
  incoming: "Sắp diễn ra",
  expired: "Hết hạn",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  refunded: "Đã hoàn tiền",
  incompleted: "Chưa hoàn tất",
};

export default function AppointmentDetail({ route }: Props) {
  const navigation = useNavigation<NavigationProp>();
  const { appointmentId } = route.params;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [appointment, setAppointment] = useState<Apointment>();

  useEffect(() => {
    setIsLoading(true);
    getRequest(`/appointments/${appointmentId}`)
      .then((response) => {
        setAppointment(response);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const statusColor = appointment
    ? statusColors[appointment.status] || "gray"
    : "gray";
  const statusText = appointment
    ? statusTextMap[appointment.status] || "Không xác định"
    : "Không xác định";

  return (
    <SafeAreaView className="flex-1 bg-gray-100 p-4">
      <View className="flex-1 p-4 mt-10">
        {isLoading ? (
          <View className="flex justify-center items-center mt-32">
            <Fold size={48} color="#000000" />
          </View>
        ) : (
          <>
            <TouchableOpacity
              className="absolute left-4 top-2 p-2 bg-gray-300 rounded-full z-10"
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-center text-black mb-5">
              Chi tiết đặt bàn
            </Text>
            <View
              className="p-4 shadow-md mb-4 border-l-4 rounded-lg bg-white"
              style={{ borderColor: statusColor }}
            >
              <Text className="text-lg font-semibold">
                Số lượng: {appointment?.tablesAppointments.length} bàn
              </Text>
              <Text className="text-lg">
                Ngày đặt: {new Date(appointment!.createdAt).toLocaleString()}
              </Text>
              <Text
                className="text-lg font-semibold"
                style={{ color: statusColor }}
              >
                Trạng thái: {statusText}
              </Text>
            </View>{" "}
            <ScrollView className="mb-4">
              {appointment!.tablesAppointments.map(
                (table: TablesAppointment, index) => (
                  <View
                    key={index}
                    className="bg-white p-4 rounded-lg shadow-md mb-2 border"
                    style={{ borderColor: statusColor }}
                  >
                    <View>
                      <Text className="text-lg font-semibold">
                        Số phòng: {table.roomId}
                      </Text>
                      <Text className="text-lg">Số bàn: {table.tableId}</Text>
                      <Text className="text-lg">Bắt đầu: </Text>
                      <Text className="text-lg">
                        Kết thúc: {new Date(table.endTime).toLocaleTimeString()}
                      </Text>
                    </View>
                    <Text className="text-lg font-semibold text-right">
                      Đơn giá: {table.price.toLocaleString()} VND
                    </Text>
                  </View>
                ),
              )}
            </ScrollView>
            <Text className="text-xl font-bold text-center text-black">
              Tổng giá: {appointment?.totalPrice.toLocaleString()} VND
            </Text>
          </>
        )}
        {/* {appointment?.status !== "cancelled" && (
          <TouchableOpacity className="bg-red-500 px-6 py-3 rounded-full mt-4 self-center">
            <Text className="text-white text-lg font-semibold">Hủy đặt</Text>
          </TouchableOpacity>
        )} */}
      </View>
    </SafeAreaView>
  );
}
