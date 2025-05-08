import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  RefreshControl,
} from "react-native";
import { Card, Button } from "@rneui/themed";
import { useAuth } from "@/context/auth-context";
import { getRequest, postRequest } from "@/helpers/api-requests";
import BackButton from "@/components/BackButton";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/constants/types/root-stack";
import { useNavigation } from "@react-navigation/native";
import {
  FontAwesome5,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import LoadingPage from "@/components/loading/loading_page";
import Toast from "react-native-toast-message";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function VoucherExchangeScreen() {
  const navigation = useNavigation<NavigationProp>();

  const { authState } = useAuth();
  const user = authState?.user;

  const [points, setPoints] = useState<number>(0);
  const [userLabel, setUserLabel] = useState<string | null>(null);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingVoucherId, setLoadingVoucherId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const pointsRes = await getRequest(`/users/points/${user?.userId}`);
      setPoints(pointsRes?.points || 0);

      const userRes = await getRequest(`/users/${user?.userId}`);
      setUserLabel(userRes?.userLabel || null);

      const voucherRes = await getRequest(`/vouchers/samples`);
      setVouchers(voucherRes?.pagedList || []);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu", error);
      Alert.alert("Lỗi", "Không thể tải dữ liệu từ server.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExchangeVoucher = async (voucherId: number) => {
    setLoadingVoucherId(voucherId);
    try {
      const res = (await postRequest("/vouchers/create-voucher", {
        sampleVoucherId: voucherId,
        userId: user?.userId,
      })) as any;

      if (res.error) {
        if (
          res.error === "You don't have enough points to exchange this voucher."
        ) {
          Toast.show({
            type: "error",
            text1: "Thất bại",
            text2: "Bạn không đủ điểm để đổi voucher này.",
          });
        } else {
          Toast.show({
            type: "error",
            text1: "Thất bại",
            text2: res.error || "Không thể đổi voucher.",
          });
        }
      } else {
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: "Đổi voucher thành công",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Thất bại",
        text2: "Không thể đổi voucher.",
      });
    } finally {
      setLoadingVoucherId(null);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(); // Re-fetch data on pull to refresh
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F4F5F7" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
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
            Đổi voucher
          </Text>
          <View style={{ width: 48 }} />
        </View>

        <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <MaterialIcons name="stars" size={20} color="#F59E0B" />
            <Text style={{ marginLeft: 8, fontSize: 16 }}>
              Điểm của bạn: {points}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <FontAwesome5 name="medal" size={18} color="#3B82F6" />
            <Text style={{ marginLeft: 8, fontSize: 16 }}>
              Danh hiệu:{" "}
              {userLabel === "top_contributor"
                ? "Top Contributor"
                : "Chưa có danh hiệu"}
            </Text>
          </View>
          {userLabel === "top_contributor" && (
            <Text
              style={{
                marginLeft: 26,
                fontSize: 13,
                color: "#10B981",
                marginTop: 2,
              }}
            >
              * Top Contributor được giảm số điểm cần thiết để đổi voucher
            </Text>
          )}
        </View>
        {isLoading ? (
          <LoadingPage />
        ) : (
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {vouchers.map((voucher, idx) => (
              <Card key={idx}>
                <Card.Title>{voucher.voucherName}</Card.Title>
                <Card.Divider />
                <Text style={{ marginBottom: 6 }}>{voucher.description}</Text>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <MaterialCommunityIcons
                    name="tag-outline"
                    size={18}
                    color="#111"
                  />
                  <Text style={{ marginLeft: 6 }}>
                    Giá trị giảm: {voucher.value?.toLocaleString()}đ
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <MaterialIcons
                    name="table-restaurant"
                    size={18}
                    color="#111"
                  />
                  <Text style={{ marginLeft: 6 }}>
                    Áp dụng cho bàn từ:{" "}
                    {voucher.minPriceCondition?.toLocaleString()}đ
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <FontAwesome5 name="coins" size={16} color="#F59E0B" />
                  {userLabel === "top_contributor" ? (
                    <Text style={{ marginLeft: 6 }}>
                      <Text style={{ color: "#10B981", fontWeight: "bold" }}>
                        {voucher.contributionPointsCost} điểm
                      </Text>
                      {"  "}
                      <Text
                        style={{
                          textDecorationLine: "line-through",
                          color: "#6B7280",
                        }}
                      >
                        {voucher.pointsCost} điểm
                      </Text>
                    </Text>
                  ) : (
                    <Text style={{ marginLeft: 6 }}>
                      Điểm cần đổi: {voucher.pointsCost}
                    </Text>
                  )}
                </View>

                <Button
                  title={
                    loadingVoucherId === voucher.voucherId
                      ? "Đang xử lý..."
                      : "Đổi ngay"
                  }
                  containerStyle={{ marginTop: 10 }}
                  onPress={() => handleExchangeVoucher(voucher.voucherId)}
                  loading={loadingVoucherId === voucher.voucherId}
                  loadingProps={{ size: "small", color: "#FFF" }}
                />
              </Card>
            ))}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
