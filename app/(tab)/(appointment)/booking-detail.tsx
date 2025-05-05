import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Button } from "@rneui/themed";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import AntDesign from "@expo/vector-icons/AntDesign";
import Toast from "react-native-toast-message";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Fold } from "react-native-animated-spinkit";

import { mapGameTypeToVietnamese } from "@/helpers/map_game_type_by_language";
import { useAuth } from "@/context/auth-context";
import PaymentDialog from "@/components/dialog/payment_dialog";
import { TableContext } from "@/context/select-table";
import { getRequest } from "@/helpers/api-requests";
import { formatDateTime } from "@/helpers/format_time";

import { ChessTable } from "@/constants/types/chess_table";
import { RootStackParamList } from "@/constants/types/root-stack";
import BackButton from "@/components/BackButton";
import LoadingPage from "@/components/loading/loading_page";
import { capitalizeWords } from "@/helpers/capitalize_first_letter";
import VoucherDialog from "@/components/dialog/voucher_dialog";
import LoadingForButton from "@/components/loading/loading_button";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BookingDetailScreen() {
  const [
    selectedTables,
    toggleTableSelection,
    removeSelectedTable,
    clearSelectedTables,
    clearSelectedTablesWithNoInvite,
  ] = useContext(TableContext);
  const navigation = useNavigation<NavigationProp>();
  const { authState, onUpdateUserBalance } = useAuth();
  const user = authState?.user;

  const [totalPrice, setTotalPrice] = useState(0);
  const [opneDialog, setOpenDialog] = useState(false);
  const [isPaymentSuccessful, setIsPaymentSuccessful] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tableOpponents, setTableOpponents] = useState<Record<number, any[]>>(
    {},
  );
  const [voucherDialogVisible, setVoucherDialogVisible] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [selectedVouchers, setSelectedVouchers] = useState<Record<number, any>>(
    {},
  );
  const [currentTableIdSelectingVoucher, setCurrentTableIdSelectingVoucher] =
    useState<number | null>(null);
  const [loadingVoucherTableId, setLoadingVoucherTableId] = useState<
    number | null
  >(null);

  const handleShowVouchers = async (tableId: number) => {
    if (!user) {
      Toast.show({
        type: "error",
        text1: "Bạn cần đăng nhập để xem voucher",
      });
      return;
    }

    try {
      setLoadingVoucherTableId(tableId);

      const res = await getRequest(`/vouchers/of-user/${user.userId}`);
      const usedVoucherIds = Object.entries(selectedVouchers)
        .filter(([tid, _]) => parseInt(tid) !== tableId)
        .map(([_, voucher]) => voucher.voucherId);

      const availableVouchers = res.pagedList.map((v: any) => ({
        ...v,
        isUsed: usedVoucherIds.includes(v.voucherId),
      }));

      setVouchers(availableVouchers);
      setCurrentTableIdSelectingVoucher(tableId);
      setVoucherDialogVisible(true);
    } catch (e) {
      console.error("Lỗi lấy voucher:", e);
      Toast.show({
        type: "error",
        text1: "Không thể tải danh sách voucher",
      });
    } finally {
      setLoadingVoucherTableId(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (onUpdateUserBalance) {
        onUpdateUserBalance();
      }
    }, []),
  );

  useEffect(() => {
    const fetchOpponents = async () => {
      const userId = user?.userId;

      if (!userId) return;

      const results: Record<number, any[]> = {};

      await Promise.all(
        selectedTables.map(async (table: any) => {
          try {
            const response = await getRequest(
              `/appointmentrequests/users/${userId}/tables/${table.tableId}`,
              {
                startTime: table.startDate,
                endTime: table.endDate,
              },
            );

            const data = response;
            results[table.tableId] = data;
          } catch (error) {
            console.error("Lỗi khi gọi API:", error);
          }
        }),
      );

      setTableOpponents(results);
    };

    fetchOpponents();
  }, [selectedTables, user]);

  useEffect(() => {
    const newTotal = selectedTables.reduce((sum: number, table: ChessTable) => {
      const hasOpponent = table.invitedUsers && table.invitedUsers.length > 0;
      const voucher = selectedVouchers[table.tableId];

      // B1: Áp dụng giảm giá
      let priceAfterVoucher = table.totalPrice;
      if (voucher) {
        priceAfterVoucher = Math.max(0, table.totalPrice - voucher.value);
      }

      // B2: Nếu có đối thủ, chia đôi
      const finalPrice = hasOpponent
        ? priceAfterVoucher / 2
        : priceAfterVoucher;

      return sum + finalPrice;
    }, 0);

    setTotalPrice(newTotal);
    if (selectedTables.length === 0 && !isPaymentSuccessful) {
      navigation.goBack();
      Toast.show({
        type: "error",
        text1: "Không có bàn đã chọn",
        text2: "Vui lòng chọn thêm bàn.",
      });
    }
  }, [selectedTables, selectedVouchers]);

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View
        style={{
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <BackButton customAction={() => navigation.goBack()} />
        <Text
          style={{
            fontSize: 20,
            fontWeight: "600",
            color: "#212529",
          }}
        >
          Chi tiết đặt bàn
        </Text>
        <View style={{ width: 48 }} />
      </View>

      <View className="px-4 mt-2">
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#007bff",
            borderRadius: 8,
            paddingVertical: 8,
            paddingHorizontal: 12,
            alignSelf: "flex-end",
            marginBottom: 10,
            marginTop: 10,
          }}
          onPress={() => {
            if (!user) {
              Toast.show({
                type: "error",
                text1: "Thất bại",
                text2: `Bạn cần đăng nhập để tiếp tục`,
              });
              return;
            }
            navigation.navigate("voucher_exchange");
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 16,
              marginRight: 6,
              fontWeight: "500",
            }}
          >
            Đổi Voucher
          </Text>
          <FontAwesome5 name="gift" size={18} color="white" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <LoadingPage />
      ) : (
        <>
          <View className="bg-white p-4 rounded-xl mb-4 shadow">
            <Text className="text-lg font-semibold flex-row items-center">
              <FontAwesome5 name="table" size={20} color="black" /> Số lượng:{" "}
              {selectedTables.length} bàn
            </Text>
          </View>

          <ScrollView className="flex-1">
            {selectedTables.map((table: ChessTable, index: any) => {
              const startDate = formatDateTime(table.startDate);
              const endDate = formatDateTime(table.endDate);
              return (
                <View
                  key={index}
                  className="bg-white p-4 rounded-xl mb-4 shadow"
                >
                  <View className="flex-row justify-between items-center">
                    <Text className="text-lg font-semibold mb-2">
                      <FontAwesome5
                        name="chess-board"
                        size={20}
                        color="black"
                      />{" "}
                      Bàn: {table.tableId}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        removeSelectedTable(table);
                      }}
                    >
                      <Ionicons name="close-circle" size={24} color="red" />
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row items-center mb-2">
                    <Ionicons name="home-outline" size={16} color="gray" />
                    <Text className="text-gray-700 ml-2">
                      Phòng: {capitalizeWords(table.roomType)}(
                      {table.roomTypePrice.toLocaleString("vi-VN")} vnd/giờ)
                    </Text>
                  </View>

                  <View className="flex-row items-center mb-2">
                    <FontAwesome5 name="chess" size={16} color="gray" />
                    <Text className="text-gray-700 ml-2">
                      Loại cờ: {capitalizeWords(table.gameType.typeName)} (
                      {table.gameTypePrice.toLocaleString("vi-VN")} vnd/giờ)
                    </Text>
                  </View>

                  <View className="flex-row flex-wrap">
                    <View className="w-1/2">
                      <Text className="text-gray-700 mb-2">
                        <Ionicons
                          name="calendar-outline"
                          size={16}
                          color="gray"
                        />
                        Ngày: {startDate.date}
                      </Text>
                      <Text className="text-gray-700 mb-2">
                        <Ionicons name="time-outline" size={16} color="gray" />{" "}
                        Giờ:
                        {startDate.time} - {endDate.time}
                      </Text>
                    </View>

                    <View className="w-1/2">
                      <Text className="text-gray-700 mb-2">
                        <Ionicons
                          name="location-outline"
                          size={16}
                          color="gray"
                        />
                        Tên phòng: {table.roomName}
                      </Text>
                      <Text className="text-gray-700 mb-2">
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={16}
                          color="gray"
                        />
                        Thời gian chơi: {table.durationInHours} giờ
                      </Text>
                    </View>
                  </View>

                  <View className="mt-3 space-y-4">
                    <View className="flex-row items-center space-x-4">
                      <Text className="text-sm text-gray-600 w-20">
                        Mời đối thủ:
                      </Text>

                      {tableOpponents[table.tableId]?.some(
                        (item) => item.status === "accepted",
                      ) ? (
                        <Image
                          source={{
                            uri:
                              tableOpponents[table.tableId].find(
                                (item) => item.status === "accepted",
                              )?.toUserNavigation?.avatarUrl ||
                              "https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg",
                          }}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <TouchableOpacity
                          onPress={() => {
                            if (!user) {
                              Toast.show({
                                type: "error",
                                text1: "Thất bại",
                                text2: `Bạn cần đăng nhập để tiếp tục`,
                              });
                              return;
                            }

                            navigation.navigate("find_opponents", {
                              tableId: table.tableId,
                              startDate: table.startDate,
                              endDate: table.endDate,
                              tablePrice: table.totalPrice / 2,
                            });
                          }}
                          className="p-2 border rounded-full"
                        >
                          <AntDesign name="adduser" size={24} color="black" />
                          {table.invitedUsers &&
                            table.invitedUsers.length > 0 && (
                              <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 items-center justify-center">
                                <Text className="text-white text-xs">
                                  {table.invitedUsers.length}
                                </Text>
                              </View>
                            )}
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Giá + Voucher */}
                    <View className="flex-row justify-between items-start">
                      {/* Giá + Ghi chú */}
                      <View className="flex-1 pr-3">
                        {(() => {
                          const voucher = selectedVouchers[table.tableId];
                          const hasOpponent =
                            table.invitedUsers && table.invitedUsers.length > 0;

                          const originalPrice = table.totalPrice;

                          let discountedPrice = originalPrice;
                          let reasons: string[] = [];

                          if (voucher) {
                            discountedPrice -= voucher.value;
                            reasons.push("voucher");
                          }

                          discountedPrice = Math.max(0, discountedPrice);

                          if (hasOpponent) {
                            discountedPrice /= 2;
                            reasons.push("đối thủ");
                          }

                          const hasDiscount = discountedPrice !== originalPrice;

                          return (
                            <View>
                              <View className="flex-row items-center flex-wrap">
                                <FontAwesome5
                                  name="money-bill-wave"
                                  size={16}
                                  color="green"
                                />

                                {hasDiscount ? (
                                  <>
                                    <Text className="ml-2 text-sm text-gray-500 line-through">
                                      {originalPrice.toLocaleString("vi-VN")}{" "}
                                      VND
                                    </Text>
                                    <Text className="ml-2 text-xl font-bold text-green-600">
                                      {discountedPrice.toLocaleString("vi-VN")}{" "}
                                      VND
                                    </Text>
                                  </>
                                ) : (
                                  <Text className="ml-2 text-xl font-bold text-green-600">
                                    {originalPrice.toLocaleString("vi-VN")} VND
                                  </Text>
                                )}
                              </View>

                              {hasDiscount && (
                                <Text className="text-sm text-gray-600 italic mt-1">
                                  Đã áp dụng: {reasons.join(" & ")}
                                </Text>
                              )}
                            </View>
                          );
                        })()}
                      </View>
                      <TouchableOpacity
                        onPress={() => handleShowVouchers(table.tableId)}
                        disabled={loadingVoucherTableId === table.tableId}
                        className={`${
                          selectedVouchers[table.tableId]
                            ? "bg-blue-500"
                            : "bg-gray-400"
                        } px-4 py-2 rounded-xl self-center flex-row items-center justify-center`}
                      >
                        {loadingVoucherTableId === table.tableId ? (
                          <LoadingForButton />
                        ) : (
                          <Text className="text-white font-medium text-sm">
                            {selectedVouchers[table.tableId]?.voucherName ||
                              "Chọn voucher"}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
          <View className="bg-white p-4 rounded-xl mt-4 shadow">
            {/* <Button
              title={
                selectedVoucher ? selectedVoucher.voucherName : "Đổi Voucher"
              }
              onPress={() => navigation.navigate("voucher_exchange")}
            /> */}

            {user && (
              <View className="flex-row items-center">
                <FontAwesome5 name="wallet" size={20} color="black" />
                <Text className="text-lg font-bold text-gray-700 ml-2">
                  Số dư: {user.wallet.balance.toLocaleString("vi-VN")} VND
                </Text>
              </View>
            )}

            <Text className="text-xl font-bold text-right text-green-700 mb-4">
              Tổng tiền: {totalPrice.toLocaleString("vi-VN")} VND
            </Text>
            <Button
              title="Xác nhận đặt bàn"
              disabled={selectedTables.length === 0}
              buttonStyle={{
                backgroundColor: "black",
                borderRadius: 10,
                paddingVertical: 12,
              }}
              onPress={() => {
                if (totalPrice > (user?.wallet.balance || 0)) {
                  Alert.alert("Số dư không đủ để thanh toán!");
                } else {
                  setOpenDialog(true);
                }
              }}
              icon={
                <FontAwesome5 name="check-circle" size={18} color="white" />
              }
              iconRight
            />

            <PaymentDialog
              visible={opneDialog}
              setIsPaymentSuccessful={setIsPaymentSuccessful}
              totalPrice={totalPrice}
              onClose={() => setOpenDialog(false)}
              setIsLoading={setIsLoading}
              tableOpponents={tableOpponents}
              selectedVouchers={selectedVouchers}
            />
          </View>
        </>
      )}
      <VoucherDialog
        visible={voucherDialogVisible}
        vouchers={vouchers}
        onClose={() => {
          setVoucherDialogVisible(false);
          setCurrentTableIdSelectingVoucher(null);
        }}
        onSelect={(voucher: any) => {
          setVoucherDialogVisible(false);
          setSelectedVouchers((prev) => {
            const updated = { ...prev };
            if (voucher) {
              updated[currentTableIdSelectingVoucher!] = voucher;
            } else {
              delete updated[currentTableIdSelectingVoucher!];
            }
            return updated;
          });
          setCurrentTableIdSelectingVoucher(null);
        }}
        totalPrice={
          currentTableIdSelectingVoucher != null
            ? selectedTables.find(
                (t: any) => t.tableId === currentTableIdSelectingVoucher,
              )?.totalPrice || 0
            : 0
        }
        initialSelectedVoucherId={
          currentTableIdSelectingVoucher != null
            ? (selectedVouchers[currentTableIdSelectingVoucher]?.voucherId ??
              null)
            : null
        }
      />
    </SafeAreaView>
  );
}
