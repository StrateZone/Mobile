import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/auth-context";
import { getRequest } from "@/helpers/api-requests";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Card } from "@rneui/themed";
import { Fold } from "react-native-animated-spinkit";

import { RootStackParamList } from "@/constants/types/root-stack";
import { Transaction } from "@/constants/types/transaction";

const TRANSLATED_CONTENT: Record<string, string> = {
  "Paid booking": "Thanh toán đặt chỗ",
  "Transaction for: Deposite": "Nạp tiền",
};

const translateContent = (content: string): string => {
  const bookingMatch = content.match(/(Paid booking) (\d+): (.+)/);
  if (bookingMatch) {
    const translated = TRANSLATED_CONTENT[bookingMatch[1]];
    return `${translated ?? bookingMatch[1]} ${bookingMatch[2]}: ${bookingMatch[3]}`;
  }

  const depositMatch = content.match(/(Transaction for: Deposite): (\d+)/);
  if (depositMatch) {
    const translated = TRANSLATED_CONTENT[depositMatch[1]];
    return `${translated ?? depositMatch[1]}: ${depositMatch[2]}`;
  }

  return content;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BalanceMovementHistory() {
  const { authState } = useAuth();
  const user = authState?.user;
  const navigation = useNavigation<NavigationProp>();

  const [balanceHistory, setBalanceHistory] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBalanceHistory = async () => {
      try {
        setIsLoading(true);
        const response = await getRequest(
          `/transactions/users/${user?.userId}`,
          {
            "page-size": 50,
            "order-by": "created-at-desc",
          },
        );
        if (response?.pagedList) {
          setBalanceHistory(response.pagedList);
        }
      } catch (error) {
        console.error("Lỗi khi lấy lịch sử biến động số dư:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalanceHistory();
  }, [user]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-5 mt-10">
        <TouchableOpacity
          className="absolute left-4 top-2 p-2 bg-gray-200 rounded-full z-10"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-center text-gray-900 mb-5">
          Biến động số dư
        </Text>
        {isLoading ? (
          <View className="flex justify-center items-center">
            <Fold size={48} color="#000000" />
          </View>
        ) : (
          <ScrollView className="space-y-4">
            {balanceHistory.map((transaction, index) => (
              <Card
                containerStyle={{ borderRadius: 10, padding: 15 }}
                key={transaction.id || index}
              >
                <View className="flex-row justify-between items-center space-x-2 min-w-0">
                  <View className="flex-1 min-w-0">
                    <Text
                      className="text-lg font-semibold text-gray-800"
                      numberOfLines={2}
                    >
                      {translateContent(transaction.content)}
                    </Text>
                    <Text className="text-sm text-gray-500" numberOfLines={1}>
                      {new Date(transaction.createdAt).toLocaleString()}
                    </Text>
                  </View>
                  <Text
                    className={`text-lg font-bold ${transaction.transactionType === 0 ? "text-green-500" : "text-red-500"} whitespace-nowrap`}
                  >
                    {transaction.transactionType === 0 ? "+" : "-"}
                    {transaction.amount.toLocaleString()} VND
                  </Text>
                </View>
              </Card>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
