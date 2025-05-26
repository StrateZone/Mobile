import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/auth-context";
import { getRequest, postRequest, putRequest } from "@/helpers/api-requests";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Toast from "react-native-toast-message";

import PaymentDialogForInvited from "@/components/dialog/payment_dialog_for_invited";

import { RootStackParamList } from "@/constants/types/root-stack";
import ConfirmCancelTableDialog from "@/components/dialog/cancle_table_dialog";
import LoadingPage from "@/components/loading/loading_page";
import BackButton from "@/components/BackButton";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function Invitations() {
  const { authState } = useAuth();
  const user = authState?.user;
  const navigation = useNavigation<NavigationProp>();

  const [invitations, setInvitations] = useState<[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [orderBy, setOrderBy] = useState<string>("created-at-desc");
  const [opneDialog, setOpenDialog] = useState(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [opneCancelAcceptTableDialog, setOpenCancelAcceptTableDialog] =
    useState(false);
  const [checkTable, setCheckTable] = useState<any>(null);
  const [cancellingTableId, setCancellingTableId] = useState<number | null>(
    null
  );
  const [selectedTableId, setSelectedTableId] = useState<number>(0);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const now = new Date();
  const convertToUTC7 = (date: Date): Date => {
    return new Date(date.getTime() + 7 * 60 * 60 * 1000);
  };
  const nowUTC7 = convertToUTC7(now);

  const handleCheckTable = async (tablesAppointmentId: number) => {
    setCancellingTableId(tablesAppointmentId);
    setSelectedTableId(tablesAppointmentId);
    try {
      const response = await getRequest(
        `/tables-appointment/cancel-check/${tablesAppointmentId}/users/${user?.userId}`,
        { CancelTime: nowUTC7.toISOString() }
      );

      setCheckTable(response);
      setOpenCancelAcceptTableDialog(true);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể kiểm tra điều kiện hủy bàn");
    } finally {
      setCancellingTableId(null);
    }
  };

  const fetchAppointments = async () => {
    try {
      if (!refreshing) setIsLoading(true);
      const response = await getRequest(
        `/appointmentrequests/to/${user?.userId}`,
        {
          "page-size": 50,
          "order-by": orderBy,
        }
      );
      if (response?.pagedList) {
        setInvitations(response?.pagedList);
      }
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử đặt bàn:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  };

  const getTimeLeft = (expireAt: string) => {
    const now = new Date();
    const expireDate = new Date(expireAt);
    const diff = expireDate.getTime() - now.getTime();

    if (diff <= 0) return "Đã hết hạn";

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60) % 60;
    const hours = Math.floor(seconds / 3600) % 24;
    const days = Math.floor(seconds / (3600 * 24));

    let result = "";
    if (days > 0) result += `${days} ngày `;
    if (hours > 0) result += `${hours} giờ `;
    if (minutes > 0) result += `${minutes} phút`;

    return `Lời mời hết hạn sau ${result.trim()}`;
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "pending":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          border: "border-yellow-500",
          display: "Chờ Phản Hồi",
          icon: (
            <Ionicons
              name="time-outline"
              size={16}
              color="#b58900"
              className="mr-1"
            />
          ),
        };
      case "accepted":
        return {
          bg: "bg-blue-100",
          text: "text-blue-700",
          border: "border-blue-500",
          display: "Đã Chấp Nhận Lời Mời",
          icon: (
            <Ionicons
              name="checkmark-circle-outline"
              size={16}
              color="blue"
              className="mr-1"
            />
          ),
        };
      case "rejected":
        return {
          bg: "bg-red-100",
          text: "text-red-700",
          border: "border-red-500",
          display: "Đã Từ Chối Lời Mời",
          icon: (
            <Ionicons
              name="close-circle-outline"
              size={16}
              color="red"
              className="mr-1"
            />
          ),
        };
      case "expired":
        return {
          bg: "bg-orange-100",
          text: "text-orange-600",
          border: "border-orange-500",
          display: "Lời Mời Đã Hết Hạn",
          icon: (
            <Ionicons
              name="time-outline"
              size={16}
              color="#fb923c"
              className="mr-1"
            />
          ),
        };
      case "cancelled":
        return {
          bg: "bg-gray-100",
          text: "text-gray-600",
          border: "border-gray-400",
          display: "Lời Mời Đã Bị Hủy",
          icon: (
            <Ionicons
              name="close-circle-outline"
              size={16}
              color="gray"
              className="mr-1"
            />
          ),
        };
      case "accepted_by_others":
        return {
          bg: "bg-pink-100",
          text: "text-pink-700",
          border: "border-pink-500",
          display: "Lời Mời Đã Được Người Khác Chấp Nhận",
          icon: (
            <Ionicons
              name="checkmark-circle-outline"
              size={16}
              color="#db2777"
              className="mr-1"
            />
          ),
        };
      case "table_cancelled":
        return {
          bg: "bg-gray-100",
          text: "text-gray-700",
          border: "border-gray-400",
          display: "Bàn Đã Bị Hủy",
          icon: (
            <Ionicons
              name="close-circle-outline"
              size={16}
              color="#6b7280"
              className="mr-1"
            />
          ),
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          border: "border-gray-400",
          display: status,
          icon: (
            <Ionicons
              name="ellipse-outline"
              size={16}
              color="gray"
              className="mr-1"
            />
          ),
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
            Lời mời đặt hẹn
          </Text>
          <View style={{ width: 48 }} />
        </View>

        {isLoading ? (
          <View className="flex justify-center items-center mt-32">
            <LoadingPage />
          </View>
        ) : (
          <ScrollView
            className="flex-1 mt-10"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {invitations.length > 0 ? (
              invitations.map((item: any) => {
                const fullName = item.fromUserNavigation?.username;
                const status = item.status;
                const statusInfo = getStatusColor(status);

                return (
                  <View
                    key={item.id}
                    className={`bg-white p-4 rounded-lg shadow-md mb-4 border-l-4 ${statusInfo.border}`}
                  >
                    <Text className="text-lg font-bold text-gray-900">
                      Người gửi: {fullName}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Ngày gửi: {new Date(item.createdAt).toLocaleString()}
                    </Text>

                    <Text className="text-sm text-gray-600">
                      Mã bàn: {item.table.tableId}
                    </Text>

                    <Text className="text-sm text-gray-600">
                      {getTimeLeft(item.expireAt)}
                    </Text>

                    {item.isPaid && (
                      <View className="flex-row items-center mt-1">
                        <FontAwesome5
                          name="check-circle"
                          size={14}
                          color="#10b981"
                        />
                        <Text className="text-sm text-emerald-600 font-medium ml-1">
                          Đã được thanh toán bởi người gửi
                        </Text>
                      </View>
                    )}

                    <View className="flex-row items-center mb-2">
                      {statusInfo.icon}
                      <Text className={`text-sm font-bold ${statusInfo.text}`}>
                        {statusInfo.display}
                      </Text>
                    </View>

                    <View className="flex-row flex-wrap gap-2 justify-start items-center">
                      <TouchableOpacity
                        className="flex-row items-center bg-black px-4 py-2 rounded-full"
                        onPress={() => {
                          navigation.navigate("invitations_detail", {
                            invitationId: item.id,
                            avatarUrl: item.fromUserNavigation.avatarUrl,
                            fullName: item.fromUserNavigation.username,
                            email: item.fromUserNavigation.email,
                            phone: item.fromUserNavigation.phone,
                            tableId: item.table.tableId,
                            roomId: item.table.roomId,
                            roomName: item.table.roomName,
                            gameType: item.table.gameType,
                            roomType: item.table.roomType,
                            startTime: item.startTime,
                            endTime: item.endTime,
                            createdAt: item.createdAt,
                            status: status,
                            totalPrice: item.totalPrice,
                            fromUserId: item.fromUser,
                            appointmentId: item.appointmentId,
                            cancellingTableId: item.tablesAppointmentId,
                            isPaid: item.isPaid,
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
                                setSelectedAppointment(item);
                                setShowPaymentDialog(true);
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

                      {status === "accepted" && (
                        <View className="flex-row justify-end mt-2">
                          <TouchableOpacity
                            className="flex-row items-center bg-red-500 px-4 py-2 rounded-full"
                            onPress={() =>
                              handleCheckTable(item.tablesAppointmentId)
                            }
                            disabled={
                              cancellingTableId === item.tablesAppointmentId
                            }
                          >
                            {cancellingTableId === item.tablesAppointmentId ? (
                              <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                              <Ionicons
                                name="close-circle"
                                size={20}
                                color="white"
                              />
                            )}
                            <Text className="text-white font-semibold ml-2">
                              Hủy bàn
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>

                    {checkTable && (
                      <ConfirmCancelTableDialog
                        visible={opneCancelAcceptTableDialog}
                        tableId={selectedTableId}
                        data={checkTable}
                        onClose={() => setOpenCancelAcceptTableDialog(false)}
                        onSuccess={() => {
                          fetchAppointments();
                          setOpenCancelAcceptTableDialog(false);
                        }}
                      />
                    )}
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

        {selectedAppointment && (
          <PaymentDialogForInvited
            visible={showPaymentDialog}
            fromUserId={selectedAppointment.fromUser}
            tableId={selectedAppointment.table.tableId}
            appointmentId={selectedAppointment.appointmentId}
            roomName={selectedAppointment.table.roomName}
            roomType={selectedAppointment.table.roomType}
            startTime={selectedAppointment.startTime}
            endTime={selectedAppointment.endTime}
            fullName={selectedAppointment.fromUserNavigation.fullName}
            tableAppointmentId={selectedAppointment.tablesAppointmentId}
            onClose={() => {
              setShowPaymentDialog(false);
              setSelectedAppointment(null);
            }}
            fetchAppointment={fetchAppointments}
            totalPrice={selectedAppointment.totalPrice}
            isPaid={selectedAppointment.isPaid}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
