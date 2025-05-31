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
import { Button, Dialog, Divider } from "@rneui/themed";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { getRequest, putRequest } from "@/helpers/api-requests";
import { RootStackParamList } from "@/constants/types/root-stack";
import { Apointment, TablesAppointment } from "@/constants/types/apointment";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { Fold } from "react-native-animated-spinkit";
import { useAuth } from "@/context/auth-context";
import ConfirmCancelTableDialog from "@/components/dialog/cancle_table_dialog";
import OpponentsListDialog from "@/components/dialog/opponents_list";
import OpponentsListForOnGoingDialog from "@/components/dialog/opponent_list_for_ongoing";
import ExtendTimeDialog from "@/components/dialog/extend_time_dialog";
import NoteDialog from "@/components/dialog/note_dialog";
import BackButton from "@/components/BackButton";
import { capitalizeWords } from "@/helpers/capitalize_first_letter";
import LoadingPage from "@/components/loading/loading_page";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ListTableRouteProp = RouteProp<
  RootStackParamList,
  "appointment_ongoing_detail"
>;
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
    case "incompleted":
      return {
        bg: "bg-orange-100",
        text: "text-orange-800",
        border: "border-orange-800",
        display: "Chưa hoàn thành",
      };

    case "checked_in":
      return {
        bg: "bg-teal-100",
        text: "text-teal-800",
        border: "border-teal-800",
        display: "Đã check-in",
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

export default function AppointmentOnGoingDetail({ route }: Props) {
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
  const [currentTableStatus, setCurrentTableStatus] = useState<string>("");
  const [cancellingTableId, setCancellingTableId] = useState<number | null>(
    null,
  );
  const [openExtendTimeDialog, setOpenExtendTimeDialog] = useState(false);
  const [selectedTableForExtend, setSelectedTableForExtend] = useState<
    number | null
  >(null);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [selectedNote, setSelectedNote] = useState("");

  const now = new Date();
  const convertToUTC7 = (date: Date): Date => {
    return new Date(date.getTime() + 7 * 60 * 60 * 1000);
  };
  const nowUTC7 = convertToUTC7(now);

  const loadAppointmentData = async () => {
    setIsLoading(true);
    try {
      const response = await getRequest(`/appointments/${appointmentId}`);
      console.log(appointmentId);
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
    setCancellingTableId(tablesAppointmentId);
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
      setCancellingTableId(null);
    }
  };

  const handleShowPlayers = (
    tableId: number,
    status: string,
    scheduleTime: string,
    endTime: string,
  ) => {
    const players =
      appointment?.appointmentrequests
        ?.filter(
          (req: any) =>
            req.tableId === tableId &&
            req.toUserNavigation &&
            req.startTime === scheduleTime &&
            req.endTime === endTime,
        )
        .map((req: any) => ({
          ...req,
          toUser: req.toUserNavigation,
        })) || [];

    setPlayersOfTable(players);
    setCurrentTableStatus(status);
    setOpenPlayerDialog(true);
  };

  const getPaymentStatus = (table: TablesAppointment) => {
    const players =
      appointment?.appointmentrequests
        ?.filter(
          (req: any) =>
            req.tableId === table.tableId &&
            req.toUserNavigation &&
            req.startTime === table.scheduleTime &&
            req.endTime === table.endTime,
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
      <View className="flex-1 p-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <BackButton customAction={() => navigation.goBack()} />
          <Text className="text-lg font-semibold text-gray-800">
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
            {/* Appointment Summary Card */}
            <View
              className={`p-4 shadow-md mb-4 border-l-4 rounded-lg bg-white ${border}`}
            >
              <Text className="text-xl font-semibold mb-3">
                Chi tiết đơn đặt hẹn
              </Text>
              <View className="space-y-2">
                <Text className="text-base">
                  <Text className="font-medium">Mã đơn:</Text>{" "}
                  {appointment?.appointmentId}
                </Text>
                <Text className="text-base">
                  <Text className="font-medium">Số lượng bàn:</Text>{" "}
                  {appointment?.tablesAppointments.length} bàn
                </Text>
                <Text className="text-base">
                  <Text className="font-medium">Ngày đặt:</Text>{" "}
                  {new Date(appointment!.createdAt).toLocaleString()}
                </Text>
                <Text className={`text-base font-medium ${text}`}>
                  Trạng thái đơn đặt: {display}
                </Text>
              </View>
            </View>

            {/* Tables List */}
            <Text className="text-xl font-semibold mb-3">
              Danh sách các bàn đã đặt:
            </Text>
            <ScrollView className="flex-1 mb-4">
              {appointment!.tablesAppointments.map(
                (table: TablesAppointment, index) => {
                  const tableStyles = getStatusStyles(table.status);

                  return (
                    <View
                      key={index}
                      className={`bg-white p-4 rounded-lg shadow-md mb-3 border`}
                      style={{ borderColor: tableStyles.text }}
                    >
                      {/* Table Header */}
                      <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-lg font-semibold text-gray-800">
                          Bàn {table.tableId}
                        </Text>
                        <View
                          className={`px-3 py-1 rounded-full ${tableStyles.bg}`}
                        >
                          <Text
                            className={`text-sm font-medium ${tableStyles.text}`}
                          >
                            {tableStyles.display}
                          </Text>
                        </View>
                      </View>

                      {/* Payment Status */}
                      <Text className="text-sm text-gray-500 mb-3">
                        {getPaymentStatus(table)}
                      </Text>

                      <Divider className="mb-3" />

                      {/* Room Details */}
                      <View className="space-y-2 mb-3">
                        <View className="flex-row justify-between items-center">
                          <Text className="text-base">
                            <Text className="font-medium">Phòng:</Text>{" "}
                            {table.table.roomName}
                          </Text>
                          <Text className="text-base">
                            <Text className="font-medium">Loại:</Text>{" "}
                            {capitalizeWords(table.table.roomType)}
                          </Text>
                        </View>

                        <Text className="text-base">
                          <Text className="font-medium">Bắt đầu:</Text>{" "}
                          {new Date(table.scheduleTime).toLocaleString()}
                        </Text>
                        <Text className="text-base">
                          <Text className="font-medium">Kết thúc:</Text>{" "}
                          {new Date(table.endTime).toLocaleString()}
                        </Text>
                      </View>

                      {/* Action Buttons */}
                      <View className="space-y-3">
                        {/* First Row - View Opponents & Notes */}
                        <View className="flex-row items-center space-x-2">
                          <TouchableOpacity
                            className="flex-1 flex-row items-center justify-center bg-blue-500 px-3 py-2 rounded-md"
                            onPress={() =>
                              handleShowPlayers(
                                table.tableId,
                                table.status,
                                table.scheduleTime,
                                table.endTime,
                              )
                            }
                          >
                            <Ionicons name="people" size={18} color="white" />
                            <Text className="ml-2 text-white text-sm font-medium">
                              Xem đối thủ
                            </Text>
                          </TouchableOpacity>

                          {table.note && table.note !== "" && (
                            <TouchableOpacity
                              className="flex-1 flex-row items-center justify-center bg-amber-500 px-3 py-2 rounded-md"
                              onPress={() => {
                                setSelectedNote(table.note || "");
                                setShowNoteDialog(true);
                              }}
                            >
                              <MaterialIcons
                                name="note"
                                size={18}
                                color="white"
                              />
                              <Text className="ml-2 text-white text-sm font-medium">
                                Xem ghi chú
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>

                        {/* Second Row - Cancel & Extend Time */}
                        <View className="flex-row items-center space-x-2">
                          {(table.status === "confirmed" ||
                            table.status === "pending") && (
                            <TouchableOpacity
                              className="flex-1 flex-row items-center justify-center bg-red-500 px-3 py-2 rounded-md"
                              onPress={() => handleCheckTable(table.id)}
                              disabled={cancellingTableId === table.id}
                            >
                              {cancellingTableId === table.id ? (
                                <Fold size={18} color="white" />
                              ) : (
                                <>
                                  <Ionicons
                                    name="close-circle"
                                    size={18}
                                    color="white"
                                  />
                                  <Text className="ml-2 text-white text-sm font-medium">
                                    Hủy bàn
                                  </Text>
                                </>
                              )}
                            </TouchableOpacity>
                          )}

                          {table.status === "checked_in" &&
                            !table.isExtended && (
                              <TouchableOpacity
                                className="flex-1 flex-row items-center justify-center bg-emerald-500 px-3 py-2 rounded-md"
                                onPress={() => {
                                  setSelectedTableForExtend(table.id);
                                  setOpenExtendTimeDialog(true);
                                }}
                              >
                                <Ionicons
                                  name="time-outline"
                                  size={18}
                                  color="white"
                                />
                                <Text className="ml-2 text-white text-sm font-medium">
                                  Gia hạn thời gian
                                </Text>
                              </TouchableOpacity>
                            )}
                        </View>
                      </View>

                      {/* Price */}
                      <View className="mt-3 pt-3 border-t border-gray-100">
                        <Text className="text-lg font-semibold text-right text-green-600">
                          Đơn giá: {table.price.toLocaleString()} VND
                        </Text>
                      </View>
                    </View>
                  );
                },
              )}
            </ScrollView>

            {/* Total Price */}
            <View className="bg-white p-4 rounded-lg shadow-sm">
              <Text className="text-xl font-bold text-center text-green-600">
                Tổng giá: {appointment?.totalPrice.toLocaleString()} VND
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Dialogs */}
      <OpponentsListForOnGoingDialog
        visible={openPlayerDialog}
        onClose={() => setOpenPlayerDialog(false)}
        loadAppointmentData={loadAppointmentData}
        players={playersOfTable}
        tableStatus={currentTableStatus}
      />

      {selectedTableForExtend && (
        <ExtendTimeDialog
          visible={openExtendTimeDialog}
          onClose={() => {
            setOpenExtendTimeDialog(false);
            setSelectedTableForExtend(null);
          }}
          tableId={selectedTableForExtend}
          appointmentId={appointmentId}
          onSuccess={loadAppointmentData}
        />
      )}

      <NoteDialog
        visible={showNoteDialog}
        onClose={() => {
          setShowNoteDialog(false);
          setSelectedNote("");
        }}
        note={selectedNote}
      />

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
    </SafeAreaView>
  );
}
