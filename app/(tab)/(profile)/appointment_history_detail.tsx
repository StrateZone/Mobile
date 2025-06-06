import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Button, Dialog } from "@rneui/themed";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { getRequest, putRequest } from "@/helpers/api-requests";
import { RootStackParamList } from "@/constants/types/root-stack";
import { Apointment, TablesAppointment } from "@/constants/types/apointment";
import { Ionicons } from "@expo/vector-icons";
import { Fold } from "react-native-animated-spinkit";
import { useAuth } from "@/context/auth-context";
import ConfirmCancelTableDialog from "@/components/dialog/cancle_table_dialog";
import OpponentsListDialog from "@/components/dialog/opponents_list";
import BackButton from "@/components/BackButton";
import { capitalizeWords } from "@/helpers/capitalize_first_letter";
import LoadingPage from "@/components/loading/loading_page";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ListTableRouteProp = RouteProp<RootStackParamList, "appointment_detail">;
type Props = {
  route: ListTableRouteProp;
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
    case "incompleted":
      return {
        bg: "bg-orange-100",
        text: "text-orange-800",
        border: "border-orange-800",
        display: "Chưa hoàn thành",
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

export default function AppointmentDetail({ route }: Props) {
  const navigation = useNavigation<NavigationProp>();
  const { appointmentId } = route.params;
  const { authState } = useAuth();
  const user = authState?.user;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [appointment, setAppointment] = useState<Apointment>();
  const [opneDialog, setOpenDialog] = useState(false);
  const [checkTable, setCheckTable] = useState<any>(null);
  const [selectedTableId, setSelectedTableId] = useState<number>(0);
  const [openPlayerDialog, setOpenPlayerDialog] = useState(false);
  const [playersOfTable, setPlayersOfTable] = useState<any[]>([]);

  const now = new Date();
  const convertToUTC7 = (date: Date): Date => {
    return new Date(date.getTime() + 7 * 60 * 60 * 1000);
  };
  const nowUTC7 = convertToUTC7(now);

  const loadAppointmentData = async () => {
    setIsLoading(true);
    try {
      const response = await getRequest(`/appointments/${appointmentId}`);
      setAppointment(response);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppointmentData();
  }, []);

  const handleCheckTable = async (tablesAppointmentId: number) => {
    setIsLoading(true);
    setSelectedTableId(tablesAppointmentId);
    try {
      const response = await getRequest(
        `/tables-appointment/cancel-check/${tablesAppointmentId}/users/${user?.userId}`,
        { CancelTime: nowUTC7.toISOString() },
      );
      setCheckTable(response);
      setOpenDialog(true);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể kiểm tra điều kiện hủy bàn");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowPlayers = (tableId: number) => {
    const players =
      appointment?.appointmentrequests
        ?.filter((req: any) => req.tableId === tableId && req.toUserNavigation)
        .map((req: any) => ({
          ...req,
          toUser: req.toUserNavigation,
        })) || [];
    setPlayersOfTable(players);
    setOpenPlayerDialog(true);
  };

  const getPaymentStatus = (table: TablesAppointment) => {
    const players =
      appointment?.appointmentrequests
        ?.filter(
          (req: any) => req.tableId === table.tableId && req.toUserNavigation,
        )
        .map((req: any) => ({
          ...req,
          toUser: req.toUserNavigation,
        })) || [];

    if (players.length === 0) {
      return "Đã thanh toán toàn bộ cho bàn chơi";
    }

    return table.paidForOpponent
      ? "Đã thanh toán toàn bộ cho bàn chơi"
      : "Đã thanh toán 50% (chia đôi với đối thủ)";
  };

  const { bg, border, text, display } = appointment
    ? getStatusStyles(appointment.status)
    : { bg: "", text: "", display: "" };

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
            Chi tiết đặt hẹn
          </Text>
          <View style={{ width: 48 }} />
        </View>

        {isLoading ? (
          <View className="flex justify-center items-center mt-32">
            <LoadingPage />
          </View>
        ) : (
          <>
            <View
              className={`p-4 shadow-md mb-4 border-l-4 rounded-lg bg-white ${border}`}
            >
              <Text className="text-xl font-semibold mb-2">
                Chi tiết đơn đặt hẹn
              </Text>
              <Text className="text-md mb-4">
                Dưới đây là các thông tin chi tiết về đơn đặt của bạn:
              </Text>

              <View className="mb-3">
                <Text className="text-lg font-semibold">
                  Mã đơn: {appointment?.appointmentId}
                </Text>
                <Text className="text-lg font-semibold">
                  Số lượng bàn: {appointment?.tablesAppointments.length} bàn
                </Text>
              </View>

              <View className="mb-3">
                <Text className="text-lg">
                  Ngày đặt: {new Date(appointment!.createdAt).toLocaleString()}
                </Text>
              </View>

              <View className="mb-4">
                <Text className={`text-lg font-semibold ${text}`}>
                  Trạng thái đơn: {display}
                </Text>
              </View>
            </View>

            <Text className="text-xl font-semibold mt-4 mb-2">
              Danh sách các bàn đã đặt:
            </Text>
            <ScrollView className="mb-4">
              {appointment!.tablesAppointments.map(
                (table: TablesAppointment, index) => {
                  const tableStyles = getStatusStyles(table.status);
                  const opponentStatusText =
                    table.invitedUsers && table.invitedUsers.length > 0
                      ? "Đã được mời"
                      : "Chưa được mời";
                  return (
                    <View
                      key={index}
                      className={`bg-white p-4 rounded-lg shadow-md mb-2 border ${tableStyles.bg}`}
                      style={{ borderColor: tableStyles.text }}
                    >
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className="font-semibold text-base text-black">
                          Bàn {table.tableId}
                        </Text>
                        {/* <Text
                          className={`text-sm font-medium ${
                            table.invitedUsers && table.invitedUsers.length > 0
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          {opponentStatusText}
                        </Text> */}
                      </View>

                      <Text className="text-sm text-gray-500 mb-1">
                        {getPaymentStatus(table)}
                      </Text>

                      <View className="flex-row justify-between items-center">
                        <Text className="text-lg font-semibold">
                          Tên phòng: {table.table.roomName}
                        </Text>
                        <Text className="text-lg">
                          Loại phòng: {capitalizeWords(table.table.roomType)}
                        </Text>
                      </View>
                      <Text className="text-lg">Mã bàn: {table.tableId}</Text>
                      <Text className="text-lg">
                        Bắt đầu: {new Date(table.scheduleTime).toLocaleString()}
                      </Text>
                      <Text className="text-lg">
                        Kết thúc: {new Date(table.endTime).toLocaleString()}
                      </Text>
                      <Text className="text-lg">
                        Trạng thái bàn: {tableStyles.display}
                      </Text>

                      <TouchableOpacity
                        className="self-start flex-row items-center bg-blue-500 px-2 py-1 rounded-md"
                        onPress={() => handleShowPlayers(table.tableId)}
                      >
                        <Ionicons name="people" size={16} color="white" />
                        <Text className="ml-1 text-white text-sm">
                          Xem đối thủ đã mời
                        </Text>
                      </TouchableOpacity>

                      <Text className="text-lg font-semibold text-right mt-2">
                        Đơn giá: {table.price.toLocaleString()} VND
                      </Text>

                      {(table.status === "confirmed" ||
                        table.status === "pending") && (
                        <View className="absolute top-4 right-2">
                          <Button
                            type="solid"
                            radius={"sm"}
                            icon={
                              <Ionicons
                                name="close-circle"
                                size={20}
                                color="white"
                              />
                            }
                            title="Hủy bàn"
                            titleStyle={{ color: "white", marginLeft: 4 }}
                            onPress={() => handleCheckTable(table.id)}
                            buttonStyle={{
                              padding: 0,
                              backgroundColor: "red",
                            }}
                          />
                        </View>
                      )}
                    </View>
                  );
                },
              )}

              {checkTable && (
                <ConfirmCancelTableDialog
                  visible={opneDialog}
                  tableId={selectedTableId}
                  data={checkTable}
                  onClose={() => setOpenDialog(false)}
                  onSuccess={() => {
                    loadAppointmentData();
                    setOpenDialog(false);
                  }}
                />
              )}
            </ScrollView>

            <Text className="text-xl font-bold text-center text-black">
              Tổng giá: {appointment?.totalPrice.toLocaleString()} VND
            </Text>
          </>
        )}
      </View>
      <OpponentsListDialog
        visible={openPlayerDialog}
        onClose={() => setOpenPlayerDialog(false)}
        players={playersOfTable}
      />
    </SafeAreaView>
  );
}
