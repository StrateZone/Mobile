import React, { useState } from "react";
import { View, Text, Modal, Alert } from "react-native";
import { Button, Card } from "@rneui/themed";
import { Feather, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useAuth } from "@/context/auth-context";

type MembershipUpgradeDialogProps = {
  open: boolean;
  setOpen: (showMembershipDialog: boolean) => void;
  onClose: () => void;
  onUpgrade: () => void;
  membershipPrice?: {
    price1: number;
    unit: string;
  };
  paymentProcessing: boolean;
};

export default function MembershipUpgradeDialog({
  open,
  membershipPrice,
  paymentProcessing,
  setOpen,
  onClose,
  onUpgrade,
}: MembershipUpgradeDialogProps) {
  const { authState } = useAuth();
  const user = authState?.user;

  const [showConfirm, setShowConfirm] = useState(false);

  const handleUpgradeClick = () => {
    if (!user) {
      setOpen(false);
      Toast.show({
        type: "error",
        text1: "Bạn chưa đăng nhập",
        text2: "Vui lòng đăng nhập để sử dụng tính năng nâng cấp.",
      });
      return;
    }

    setOpen(false);
    setShowConfirm(true);
  };

  const cancelConfirm = () => setShowConfirm(false);
  const confirmUpgrade = () => {
    if (80000 > user!.wallet.balance) {
      onClose();
      Alert.alert("Số dư không đủ để thanh toán!");
    }

    setShowConfirm(false);
    onUpgrade();
  };

  const features = [
    { icon: "message-circle", text: "Tạo và tham gia thảo luận" },
    { icon: "users", text: "Bình luận và tương tác" },
    { icon: "shield", text: "Kết nối cộng đồng" },
    // { icon: "gift", text: "Ưu đãi đặc biệt" },
  ];

  return (
    <>
      {/* Main Dialog */}
      <Modal visible={open} transparent animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/50 px-4">
          <Card containerStyle={{ borderRadius: 16, width: "100%" }}>
            <View className="items-center mb-4">
              <Feather name="arrow-up-circle" size={48} color="#22c55e" />
              <Text className="text-2xl font-bold text-gray-900 mt-3">
                Nâng Cấp Tài Khoản Member
              </Text>
              <Text className="text-gray-600 mt-1 text-center">
                Trải nghiệm đầy đủ các tính năng cộng đồng
              </Text>
            </View>

            <View className="bg-green-50 p-4 rounded-lg mb-4">
              <Text className="text-lg font-semibold mb-2">
                Tài khoản Member
              </Text>
              {membershipPrice && (
                <Text className="text-2xl font-bold text-green-600 mb-2">
                  80,000₫{" "}
                  <Text className="text-base text-gray-500 font-normal">
                    /{" "}
                    {membershipPrice.unit === "per month"
                      ? "tháng"
                      : membershipPrice.unit}
                  </Text>
                </Text>
              )}

              {features.map((f, idx) => (
                <View key={idx} className="flex-row items-start mb-2">
                  <View className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                    <Feather name={f.icon as any} size={16} color="#22c55e" />
                  </View>
                  <Text className="text-sm text-gray-800">{f.text}</Text>
                </View>
              ))}
            </View>

            <View className="flex-row space-x-3 mt-4">
              <Button
                title="Để sau"
                type="outline"
                onPress={onClose}
                containerStyle={{ flex: 1 }}
              />
              <Button
                title={paymentProcessing ? "Đang xử lý..." : "Nâng cấp ngay"}
                onPress={handleUpgradeClick}
                disabled={paymentProcessing}
                loading={paymentProcessing}
                buttonStyle={{ backgroundColor: "#22c55e" }}
                containerStyle={{ flex: 1 }}
              />
            </View>
          </Card>
        </View>
      </Modal>

      {/* Confirmation Dialog */}
      <Modal visible={showConfirm} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50 px-4">
          <Card containerStyle={{ borderRadius: 16, width: "100%" }}>
            <View className="items-center mb-4">
              <Ionicons name="alert-circle-outline" size={48} color="#facc15" />
              <Text className="text-xl font-bold text-gray-900 mt-2">
                Xác nhận nâng cấp
              </Text>
              <Text className="text-gray-600 text-center mt-2">
                Bạn có chắc muốn nâng cấp tài khoản với giá{" "}
                <Text className="text-green-600 font-bold">
                  80,000₫/
                  {membershipPrice?.unit === "per month"
                    ? "tháng"
                    : membershipPrice?.unit}
                </Text>
                ?
              </Text>
            </View>
            <View className="flex-row space-x-3">
              <Button
                title="Hủy bỏ"
                type="outline"
                onPress={cancelConfirm}
                containerStyle={{ flex: 1 }}
              />
              <Button
                title="Xác nhận"
                onPress={confirmUpgrade}
                buttonStyle={{ backgroundColor: "#22c55e" }}
                containerStyle={{ flex: 1 }}
              />
            </View>
          </Card>
        </View>
      </Modal>
    </>
  );
}
