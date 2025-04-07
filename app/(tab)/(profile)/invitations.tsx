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

export default function Invitations() {
  const { authState } = useAuth();
  const user = authState?.user;
  const navigation = useNavigation<NavigationProp>();

  const [invitations, setInvitations] = useState<[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [orderBy, setOrderBy] = useState<string>("created-at-desc");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        const response = await getRequest(
          `/appointmentrequests/to/${user?.userId}`,
          {
            "page-size": 50,
            "order-by": orderBy,
          },
        );
        if (response?.pagedList) {
          setInvitations(response?.pagedList);
        }
      } catch (error) {
        console.error("Lỗi khi lấy lịch sử đặt bàn:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  const statusColors: Record<string, string> = {
    pending: "#b58900",
    confirmed: "green",
    checked_in: "teal",
    completed: "blue",
    cancelled: "red",
    unpaid: "gray",
    expired: "purple",
    refunded: "orange",
  };

  const statusTextMap: Record<string, string> = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    checked_in: "Đã check-in",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
    unpaid: "Chưa thanh toán",
    expired: "Đã hết hạn",
    refunded: "Đã hoàn tiền",
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
          Lời mời đặt bàn
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
            {invitations.length > 0 ? (
              invitations.map((item) => {
                const fullName = item.fromUserNavigation?.fullName;
                const status = item.status;
                const statusColor = statusColors[status];
                const statusText = statusTextMap[status];

                return (
                  <View
                    key={item.id}
                    className="bg-white p-4 rounded-lg shadow-md mb-4 border-l-4"
                    style={{ borderColor: statusColor }}
                  >
                    <Text className="text-lg font-bold text-gray-900">
                      Người gửi: {fullName}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Ngày gửi: {new Date(item.createdAt).toLocaleString()}
                    </Text>
                    <Text
                      className="text-sm font-bold mb-2"
                      style={{ color: statusColor }}
                    >
                      Trạng thái: {statusText}
                    </Text>

                    <View className="flex-row flex-wrap gap-2 justify-start items-center">
                      <TouchableOpacity
                        className="flex-row items-center bg-black px-4 py-2 rounded-full"
                        onPress={() => {
                          if (item.appointmentId) {
                            navigation.navigate("appointment_detail", {
                              appointmentId: item.appointmentId,
                            });
                          }
                        }}
                      >
                        <Ionicons
                          name="eye"
                          size={18}
                          color="white"
                          className="mr-1"
                        />
                        <Text className="text-white font-semibold ml-1">
                          Xem
                        </Text>
                      </TouchableOpacity>

                      {status === "active" && (
                        <>
                          <TouchableOpacity
                            className="flex-row items-center bg-green-600 px-4 py-2 rounded-full"
                            onPress={() => {
                              console.log("Đồng ý lời mời", item.id);
                            }}
                          >
                            <FontAwesome5
                              name="check"
                              size={16}
                              color="white"
                            />
                            <Text className="text-white font-semibold ml-2">
                              Đồng ý
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            className="flex-row items-center bg-red-500 px-4 py-2 rounded-full"
                            onPress={() => {
                              console.log("Từ chối lời mời", item.id);
                            }}
                          >
                            <FontAwesome5
                              name="times"
                              size={16}
                              color="white"
                            />
                            <Text className="text-white font-semibold ml-2">
                              Từ chối
                            </Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                );
              })
            ) : (
              <Text className="text-center text-gray-500">
                Chưa có lời mời đặt bàn.
              </Text>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
