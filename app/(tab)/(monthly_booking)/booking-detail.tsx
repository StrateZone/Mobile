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
import { Button, CheckBox } from "@rneui/themed";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import AntDesign from "@expo/vector-icons/AntDesign";
import Toast from "react-native-toast-message";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Fold } from "react-native-animated-spinkit";

import { mapGameTypeToVietnamese } from "@/helpers/map_game_type_by_language";
import { useAuth } from "@/context/auth-context";
import PaymentDialog from "@/components/dialog/payment_dialog";
import { MonthlyTableContext } from "@/context/select-monthly-table";
import { getRequest } from "@/helpers/api-requests";
import { formatDateTime } from "@/helpers/format_time";

import { ChessTable } from "@/constants/types/chess_table";
import { RootStackParamList } from "@/constants/types/root-stack";
import BackButton from "@/components/BackButton";
import LoadingPage from "@/components/loading/loading_page";
import { capitalizeWords } from "@/helpers/capitalize_first_letter";
import VoucherDialog from "@/components/dialog/voucher_dialog";
import LoadingForButton from "@/components/loading/loading_button";
import MonthlyPaymentDialog from "@/components/dialog/monthly_payment_dialog";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MonthlyBookingDetailScreen() {
  const [
    selectedTables,
    toggleTableSelection,
    removeSelectedTable,
    clearSelectedTables,
    clearSelectedTablesWithNoInvite,
  ] = useContext(MonthlyTableContext);
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
  const [selectedVouchers, setSelectedVouchers] = useState<Record<string, any>>(
    {},
  );
  const [currentTableSelectingVoucher, setCurrentTableSelectingVoucher] =
    useState<{
      tableId: number;
      startDate: string;
      endDate: string;
    } | null>(null);
  const [loadingVoucherTableId, setLoadingVoucherTableId] = useState<
    number | null
  >(null);
  const [paidForOpponent, setPaidForOpponent] = useState(false);

  const getTableKey = (tableId: number, startDate: string, endDate: string) => {
    return `${tableId}-${startDate}-${endDate}`;
  };

  const handleShowVouchers = async (table: ChessTable) => {
    if (!user) {
      Toast.show({
        type: "error",
        text1: "Bạn cần đăng nhập để xem voucher",
      });
      return;
    }

    try {
      setLoadingVoucherTableId(table.tableId);

      const res = await getRequest(`/vouchers/of-user/${user.userId}`);
      const usedVoucherIds = Object.entries(selectedVouchers)
        .filter(
          ([key, _]) =>
            key !== getTableKey(table.tableId, table.startDate, table.endDate),
        )
        .map(([_, voucher]) => voucher.voucherId);

      const availableVouchers = res.pagedList.map((v: any) => ({
        ...v,
        isUsed: usedVoucherIds.includes(v.voucherId),
      }));

      setVouchers(availableVouchers);
      setCurrentTableSelectingVoucher({
        tableId: table.tableId,
        startDate: table.startDate,
        endDate: table.endDate,
      });
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
      const voucher =
        selectedVouchers[
          getTableKey(table.tableId, table.startDate, table.endDate)
        ];

      // B1: Áp dụng giảm giá
      let priceAfterVoucher = table.totalPrice;
      if (voucher) {
        priceAfterVoucher = Math.max(0, table.totalPrice - voucher.value);
      }

      // B2: Nếu có đối thủ và không thanh toán toàn bộ, chia đôi
      const finalPrice =
        hasOpponent && !paidForOpponent
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
  }, [selectedTables, selectedVouchers, paidForOpponent]);

  // Thêm hàm kiểm tra xem có bàn nào đã mời người chơi không
  const hasInvitedOpponents = selectedTables.some(
    (table: ChessTable) => table.invitedUsers && table.invitedUsers.length > 0,
  );

  const getTablePriceInfo = (table: ChessTable) => {
    const hasOpponent = table.invitedUsers && table.invitedUsers.length > 0;
    const voucher =
      selectedVouchers[
        getTableKey(table.tableId, table.startDate, table.endDate)
      ];
    let discountedPrice = table.totalPrice;
    const reasons: string[] = [];

    if (voucher) {
      discountedPrice = Math.max(0, table.totalPrice - voucher.value);
      reasons.push(`Giảm giá voucher: ${voucher.value.toLocaleString()} VND`);
    }

    if (hasOpponent && !paidForOpponent) {
      discountedPrice /= 2;
      reasons.push("Chia đôi với đối thủ");
    } else if (hasOpponent && paidForOpponent) {
      reasons.push("Thanh toán toàn bộ cho bàn chơi");
    }

    return {
      originalPrice: table.totalPrice,
      finalPrice: discountedPrice,
      reasons,
      hasDiscount: discountedPrice !== table.totalPrice,
    };
  };

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
            navigation.navigate("voucher_exchange_monthly");
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
            <Text className="text-lg font-semibold flex-row items-center mb-4">
              <FontAwesome5 name="table" size={20} color="black" /> Số lượng:{" "}
              {selectedTables.length} bàn
            </Text>

            {selectedTables.length < 4 && (
              <Text className="text-sm text-red-500 mb-4">
                Số bàn tối thiểu bạn cần đặt là: 4. Hiện tại bạn đã chọn:{" "}
                {selectedTables.length} bàn.
              </Text>
            )}

            {hasInvitedOpponents && (
              <View className="mb-4">
                <Text className="text-base font-medium mb-2">
                  Phương thức thanh toán:
                </Text>
                <CheckBox
                  title="Thanh toán toàn bộ"
                  checked={paidForOpponent}
                  onPress={() => setPaidForOpponent(!paidForOpponent)}
                  containerStyle={{ marginBottom: 8 }}
                  textStyle={{ fontSize: 14 }}
                />
                <Text className="text-sm text-gray-500 ml-8">
                  {paidForOpponent
                    ? "Bạn sẽ thanh toán toàn bộ số tiền cho bàn chơi"
                    : "Bạn sẽ thanh toán 50% và chia đôi với đối thủ"}
                </Text>
              </View>
            )}
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

                            navigation.navigate("find_opponents_monthly", {
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
                        <View className="mt-2">
                          {getTablePriceInfo(table).hasDiscount ? (
                            <>
                              <Text className="text-sm text-gray-400 text-right line-through">
                                {getTablePriceInfo(
                                  table,
                                ).originalPrice.toLocaleString()}{" "}
                                VND
                              </Text>
                              <Text className="text-lg font-semibold text-right text-green-600">
                                {getTablePriceInfo(
                                  table,
                                ).finalPrice.toLocaleString()}{" "}
                                VND
                              </Text>
                            </>
                          ) : (
                            <Text className="text-lg font-semibold text-right">
                              {getTablePriceInfo(
                                table,
                              ).finalPrice.toLocaleString()}{" "}
                              VND
                            </Text>
                          )}
                          {getTablePriceInfo(table).reasons.map(
                            (reason, index) => (
                              <Text
                                key={index}
                                className="text-sm text-gray-500 text-right"
                              >
                                {reason}
                              </Text>
                            ),
                          )}
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleShowVouchers(table)}
                        disabled={loadingVoucherTableId === table.tableId}
                        className={`${
                          selectedVouchers[
                            getTableKey(
                              table.tableId,
                              table.startDate,
                              table.endDate,
                            )
                          ]
                            ? "bg-blue-500"
                            : "bg-gray-400"
                        } px-4 py-2 rounded-xl self-center flex-row items-center justify-center`}
                      >
                        {loadingVoucherTableId === table.tableId ? (
                          <LoadingForButton />
                        ) : (
                          <Text className="text-white font-medium text-sm">
                            {selectedVouchers[
                              getTableKey(
                                table.tableId,
                                table.startDate,
                                table.endDate,
                              )
                            ]?.voucherName || "Chọn voucher"}
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
              disabled={
                selectedTables.length === 0 || selectedTables.length < 4
              }
              buttonStyle={{
                backgroundColor:
                  selectedTables.length < 4 ? "#cbd5e1" : "black",
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

            <MonthlyPaymentDialog
              visible={opneDialog}
              setIsPaymentSuccessful={setIsPaymentSuccessful}
              totalPrice={totalPrice}
              onClose={() => setOpenDialog(false)}
              setIsLoading={setIsLoading}
              tableOpponents={tableOpponents}
              selectedVouchers={selectedVouchers}
              paidForOpponent={paidForOpponent}
            />
          </View>
        </>
      )}
      <VoucherDialog
        visible={voucherDialogVisible}
        vouchers={vouchers}
        onClose={() => {
          setVoucherDialogVisible(false);
          setCurrentTableSelectingVoucher(null);
        }}
        onSelect={(voucher: any) => {
          setVoucherDialogVisible(false);
          if (currentTableSelectingVoucher) {
            const tableKey = getTableKey(
              currentTableSelectingVoucher.tableId,
              currentTableSelectingVoucher.startDate,
              currentTableSelectingVoucher.endDate,
            );
            setSelectedVouchers((prev) => {
              const updated = { ...prev };
              if (voucher) {
                updated[tableKey] = voucher;
              } else {
                delete updated[tableKey];
              }
              return updated;
            });
          }
          setCurrentTableSelectingVoucher(null);
        }}
        totalPrice={
          currentTableSelectingVoucher != null
            ? selectedTables.find(
                (t: any) =>
                  t.tableId === currentTableSelectingVoucher.tableId &&
                  t.startDate === currentTableSelectingVoucher.startDate &&
                  t.endDate === currentTableSelectingVoucher.endDate,
              )?.totalPrice || 0
            : 0
        }
        initialSelectedVoucherId={
          currentTableSelectingVoucher != null
            ? (selectedVouchers[
                getTableKey(
                  currentTableSelectingVoucher.tableId,
                  currentTableSelectingVoucher.startDate,
                  currentTableSelectingVoucher.endDate,
                )
              ]?.voucherId ?? null)
            : null
        }
      />
    </SafeAreaView>
  );
}
