import React, { useState, useEffect } from "react";
import { View, Text, Modal, ScrollView } from "react-native";
import { Button, Card } from "@rneui/themed";
import {
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";

const VoucherDialog = ({
  visible,
  onClose,
  vouchers,
  onSelect,
  totalPrice,
  initialSelectedVoucherId,
}: any) => {
  const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(
    initialSelectedVoucherId,
  );

  useEffect(() => {
    if (visible) {
      setSelectedVoucherId(initialSelectedVoucherId);
    }
  }, [initialSelectedVoucherId, visible]);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View className="bg-white w-full rounded-2xl p-4 max-h-[85%]">
          <Text className="text-xl font-bold text-center mb-4">
            Chọn Voucher
          </Text>

          <ScrollView>
            {vouchers.length === 0 ? (
              <View className="items-center mt-6">
                <FontAwesome5 name="sad-tear" size={40} color="#9CA3AF" />
                <Text className="text-gray-500 mt-2">
                  Bạn chưa có voucher nào
                </Text>
              </View>
            ) : (
              vouchers.map((voucher: any, idx: number) => {
                const isSelected = voucher.voucherId === selectedVoucherId;
                const isAlreadyUsed = voucher.isUsed;
                const isDisabled =
                  isAlreadyUsed || totalPrice < voucher.minPriceCondition;

                return (
                  <Card
                    key={idx}
                    containerStyle={{
                      borderColor: isSelected ? "#3B82F6" : "#E5E7EB",
                      borderWidth: 1.2,
                      borderRadius: 16,
                      backgroundColor: isSelected ? "#EFF6FF" : "#fff",
                      shadowColor: "#000",
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      marginBottom: 12,
                    }}
                  >
                    <Card.Title style={{ fontSize: 18, fontWeight: "bold" }}>
                      {voucher.voucherName}
                    </Card.Title>
                    <Card.Divider />

                    <Text style={{ marginBottom: 6 }}>
                      {voucher.description}
                    </Text>

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

                    {!isSelected && totalPrice < voucher.minPriceCondition && (
                      <Text style={{ color: "red", marginTop: 4 }}>
                        Cần tối thiểu{" "}
                        {voucher.minPriceCondition?.toLocaleString()}đ
                      </Text>
                    )}

                    {isAlreadyUsed && (
                      <Text style={{ color: "red", marginTop: 4 }}>
                        Voucher đã được áp dụng cho bàn khác
                      </Text>
                    )}

                    <Button
                      title={isSelected ? "Bỏ chọn" : "Chọn"}
                      disabled={isDisabled}
                      type={isSelected ? "solid" : "outline"}
                      buttonStyle={{
                        borderRadius: 8,
                        backgroundColor: isSelected ? "#3B82F6" : "#fff",
                        borderColor: "#3B82F6",
                      }}
                      titleStyle={{
                        color: isSelected ? "#fff" : "#3B82F6",
                        fontWeight: "600",
                      }}
                      containerStyle={{ marginTop: 10 }}
                      onPress={() => {
                        if (isSelected) {
                          setSelectedVoucherId(null);
                          onSelect(null);
                        } else {
                          setSelectedVoucherId(voucher.voucherId);
                          onSelect(voucher);
                        }
                      }}
                    />
                  </Card>
                );
              })
            )}
          </ScrollView>

          <Button
            title="Đóng"
            onPress={onClose}
            buttonStyle={{ marginTop: 12, borderRadius: 10 }}
          />
        </View>
      </View>
    </Modal>
  );
};

export default VoucherDialog;
