import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
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
import BottomSheetSortAppointment from "@/components/bottom_sheet/bottom_sheet_sort_appointment";
import LoadingPage from "@/components/loading/loading_page";
import BackButton from "@/components/BackButton";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function AppointmentHistory() {
  const { authState } = useAuth();
  const user = authState?.user;
  const navigation = useNavigation<NavigationProp>();

  const [appointments, setAppointments] = useState<Apointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSortBottomSheet, setShowSortBottomSheet] = useState(false);
  const [selectedSort, setSelectedSort] = useState("created-at-desc");

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const response = await getRequest(`/appointments/users/${user?.userId}`, {
        "page-size": 50,
        "order-by": selectedSort,
      });
      if (response?.pagedList) {
        setAppointments(response?.pagedList);
      }
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử đặt bàn:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedSort]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  };

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          border: "border-yellow-800",
          display: "Đang chờ thanh toán",
        };
      case "confirmed":
        return {
          bg: "bg-green-100",
          text: "text-green-800",
          border: "border-green-800",
          display: "Đã thanh toán",
        };
      case "incoming":
        return {
          bg: "bg-blue-100",
          text: "text-blue-800",
          border: "border-blue-800",
          display: "Sắp diễn ra",
        };
      case "expired":
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          border: "border-gray-800",
          display: "Hết hạn",
        };
      case "completed":
        return {
          bg: "bg-purple-100",
          text: "text-purple-800",
          border: "border-purple-800",
          display: "Đã Hoàn thành",
        };
      case "cancelled":
        return {
          bg: "bg-red-100",
          text: "text-red-800",
          border: "border-red-800",
          display: "Đã hủy",
        };
      case "refunded":
        return {
          bg: "bg-indigo-100",
          text: "text-indigo-800",
          border: "border-indigo-800",
          display: "Đã hoàn tiền",
        };
      case "unfinished":
        return {
          bg: "bg-orange-100",
          text: "text-orange-800",
          border: "border-orange-800",
          display: "Không hoàn thành",
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          border: "border-gray-800",
          display: status,
        };
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-1 p-4 ">
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <BackButton customAction={() => navigation.goBack()} />
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#212529" }}>
            Lịch sử đặt hẹn
          </Text>
          <View style={{ width: 48 }} />
        </View>
        <View className="flex-row items-center justify-end mb-4">
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
            onPress={() => setShowSortBottomSheet(!showSortBottomSheet)}
          />
        </View>

        {isLoading ? (
          <View className="flex justify-center items-center">
            <LoadingPage />
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {appointments.length > 0 ? (
              appointments
                .filter(
                  (item) =>
                    item.status.toLowerCase() === "completed" ||
                    item.status.toLowerCase() === "unfinished",
                )
                .map((item) => {
                  const { bg, text, border, display } = getStatusStyles(
                    item.status,
                  );

                  return (
                    <View
                      key={item.appointmentId}
                      className={`bg-white p-4 rounded-lg shadow-md mb-4 border-l-4 ${border}`}
                    >
                      <Text className="text-lg font-bold text-gray-900">
                        Mã đơn: {item.appointmentId}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        Ngày tạo: {new Date(item.createdAt).toLocaleString()}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        Số bàn: {item.tablesCount}
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
      {showSortBottomSheet && (
        <BottomSheetSortAppointment
          selectedSort={selectedSort}
          onSelectSort={(sort) => setSelectedSort(sort)}
          onClose={() => setShowSortBottomSheet(false)}
        />
      )}
    </SafeAreaView>
  );
}
