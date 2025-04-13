import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/auth-context";
import { getRequest, postRequest, putRequest } from "@/helpers/api-requests";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Button, Icon } from "@rneui/themed";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Fold } from "react-native-animated-spinkit";
import Toast from "react-native-toast-message";

import PaymentDialogForInvited from "@/components/dialog/payment_dialog_for_invited";

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
  const [opneDialog, setOpenDialog] = useState(false);

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
  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const handleReject = async (invitationId: number) => {
    setIsLoading(true);
    await putRequest(`/appointmentrequests/reject/${invitationId}`, {})
      .then(() => {
        setIsLoading(false);
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: `Đã từ chối lời mời`,
        });
        fetchAppointments();
      })
      .catch((e) => {
        setIsLoading(false);
        console.error(e);
      });
  };

  const statusColors: Record<string, string> = {
    pending: "#b58900",
    accepted: "green",
    rejected: "red",
    cancelled: "gray",
    expired: "purple",
    payment_required: "orange",
    await_appointment_creation: "blue",
  };

  const statusTextMap: Record<string, string> = {
    pending: "Chờ xử lý",
    accepted: "Đã chấp nhận",
    rejected: "Bị từ chối",
    cancelled: "Đã hủy",
    expired: "Đã hết hạn",
    payment_required: "Cần thanh toán",
    await_appointment_creation: "Chờ tạo lịch hẹn",
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

        {isLoading ? (
          <View className="flex justify-center items-center mt-32">
            <Fold size={48} color="#000000" />
          </View>
        ) : (
          <ScrollView className="flex-1 mt-10">
            {invitations.length > 0 ? (
              invitations.map((item: any) => {
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
                          navigation.navigate("invitations_detail", {
                            invitationId: item.id,
                            avatarUrl: item.fromUserNavigation.avatarUrl,
                            fullName: item.fromUserNavigation.fullName,
                            email: item.fromUserNavigation.email,
                            phone: item.fromUserNavigation.phone,
                            tableId: item.table.tableId,
                            roomId: item.table.roomId,
                            roomName: item.table.roomName,
                            roomType: item.table.roomType,
                            startTime: item.startTime,
                            endTime: item.endTime,
                            createdAt: item.createdAt,
                            status: status,
                          });
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

                      {status === "pending" && (
                        <>
                          <TouchableOpacity
                            className="flex-row items-center bg-green-600 px-4 py-2 rounded-full"
                            onPress={() => {
                              if (
                                item.totalPrice > (user?.wallet.balance || 0)
                              ) {
                                Alert.alert("Số dư không đủ để thanh toán!");
                              } else {
                                setOpenDialog(true);
                              }
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
                            onPress={() => handleReject(item.id)}
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
                    {/* onPress={() => handleAccept(item.fromUser,item.table.tableId,item.appointmentId)} */}
                    <PaymentDialogForInvited
                      visible={opneDialog}
                      fromUserId={item.fromUser}
                      tableId={item.table.tableId}
                      appointmentId={item.appointmentId}
                      roomName={item.table.roomName}
                      roomType={item.table.roomType}
                      startTime={item.startTime}
                      endTime={item.endTime}
                      fullName={item.fromUserNavigation.fullName}
                      onClose={() => setOpenDialog(false)}
                      setIsLoading={setIsLoading}
                      fetchAppointment={fetchAppointments}
                      totalPrice={item.totalPrice}
                    />
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
