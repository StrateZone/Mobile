import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/auth-context";
import { getRequest } from "@/helpers/api-requests";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Button, Icon } from "@rneui/themed";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Fold } from "react-native-animated-spinkit";

import { Apointment } from "@/constants/types/apointment";
import { RootStackParamList } from "@/constants/types/root-stack";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function AppointmentHistory() {
  const { authState } = useAuth();
  const user = authState?.user;
  const navigation = useNavigation<NavigationProp>();

  const [appointments, setAppointments] = useState<Apointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [orderBy, setOrderBy] = useState<string>("created-at-desc");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        const response = await getRequest(
          `/appointments/users/${user?.userId}`,
          {
            "page-size": 50,
            "order-by": orderBy,
          },
        );
        if (response?.pagedList) {
          setAppointments(response?.pagedList);
        }
      } catch (error) {
        console.error("Lỗi khi lấy lịch sử đặt bàn:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          display: "Đang chờ thanh toán",
        };
      case "confirmed":
        return {
          bg: "bg-green-100",
          text: "text-green-800",
          display: "Đã thanh toán",
        };
      case "incoming":
        return {
          bg: "bg-blue-100",
          text: "text-blue-800",
          display: "Sắp diễn ra",
        };
      case "expired":
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          display: "Hết hạn",
        };
      case "completed":
        return {
          bg: "bg-purple-100",
          text: "text-purple-800",
          display: "Đã Hoàn thành",
        };
      case "cancelled":
        return {
          bg: "bg-red-100",
          text: "text-red-800",
          display: "Đã hủy",
        };
      case "refunded":
        return {
          bg: "bg-indigo-100",
          text: "text-indigo-800",
          display: "Đã hoàn tiền",
        };
      case "unfinished":
        return {
          bg: "bg-orange-100",
          text: "text-orange-800",
          display: "Không hoàn thành",
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          display: status,
        };
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-1 p-4 mt-10">
        <TouchableOpacity
          className="absolute left-4 top-2 p-2 mt-2 bg-gray-300 rounded-full z-10"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-center text-black mb-5">
          Lịch sử đặt hẹn
        </Text>
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1 mr-2"></View>
          <Button
            icon={
              <FontAwesome5
                name="sort-amount-down-alt"
                size={20}
                type="feather"
                color="white"
              />
            }
            buttonStyle={{ backgroundColor: "black", borderRadius: 10 }}
          />
        </View>
        {isLoading ? (
          <View className="flex justify-center items-center">
            <Fold size={48} color="#000000" />
          </View>
        ) : (
          <ScrollView className="flex-1">
            {appointments.length > 0 ? (
              appointments
                .filter(
                  (item) =>
                    item.status.toLowerCase() === "completed" ||
                    item.status.toLowerCase() === "unfinished",
                )
                .map((item) => {
                  const { bg, text, display } = getStatusStyles(item.status);

                  return (
                    <View
                      key={item.appointmentId}
                      className={`bg-white p-4 rounded-lg shadow-md mb-4 border-l-4`}
                      style={{ borderColor: "#00000020" }}
                    >
                      <Text className="text-lg font-bold text-gray-900">
                        Mã đơn: {item.appointmentId}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        Ngày tạo: {new Date(item.createdAt).toLocaleString()}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        Số bàn: {item.tablesAppointments.length}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        Tổng giá: {item.totalPrice.toLocaleString()} VND
                      </Text>
                      <Text className={`text-sm font-bold ${text}`}>
                        Trạng thái: {display}
                      </Text>

                      <TouchableOpacity
                        className="mt-3 bg-black text-white px-4 py-2 rounded-full"
                        onPress={() =>
                          navigation.navigate("appointment_detail", {
                            appointmentId: item.appointmentId,
                          })
                        }
                      >
                        <Text className="text-white text-center font-semibold">
                          Xem chi tiết
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })
            ) : (
              <Text className="text-center text-gray-500">
                Chưa có lịch sử đặt hẹn.
              </Text>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
