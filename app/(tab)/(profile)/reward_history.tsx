import { View, Text, SafeAreaView, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@/context/auth-context";
import { getRequest } from "@/helpers/api-requests";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Card } from "@rneui/themed";
import LoadingPage from "@/components/loading/loading_page";
import BackButton from "@/components/BackButton";
import { RootStackParamList } from "@/constants/types/root-stack";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function RewardHistory() {
  const { authState } = useAuth();
  const user = authState?.user;
  const navigation = useNavigation<NavigationProp>();

  const [pointsData, setPointsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPointHistory = async () => {
      try {
        setIsLoading(true);
        const response = await getRequest(
          `/points-history/of-user/${user?.userId}`,
          {
            "page-size": 50,
            "order-by": "created-at-desc",
          },
        );
        if (response?.pagedList) {
          setPointsData(response.pagedList);
        }
      } catch (error) {
        console.error("Lỗi khi lấy lịch sử điểm:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPointHistory();
  }, [user]);

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-6">
          <BackButton customAction={() => navigation.goBack()} />
          <Text className="text-lg font-semibold text-gray-900">
            Lịch sử điểm thưởng
          </Text>
          <View style={{ width: 48 }} />
        </View>

        {isLoading ? (
          <LoadingPage />
        ) : (
          <ScrollView className="space-y-4">
            {pointsData.length === 0 ? (
              <Text className="text-center text-gray-500">
                Bạn chưa có điểm thưởng nào.
              </Text>
            ) : (
              pointsData.map((entry, index) => (
                <Card
                  key={entry.id || index}
                  containerStyle={{
                    borderRadius: 12,
                    padding: 16,
                    backgroundColor: "#F8FAFC",
                  }}
                >
                  <View className="flex-row justify-between items-center space-x-2">
                    <View className="flex-1">
                      <Text className="text-base font-medium text-gray-800">
                        {entry.content}
                      </Text>
                      <Text className="text-sm text-gray-500 mt-1">
                        {new Date(entry.createdAt).toLocaleString("vi-VN")}
                      </Text>
                    </View>
                    <Text className="text-green-600 font-bold text-lg">
                      {entry.amount} điểm
                    </Text>
                  </View>
                </Card>
              ))
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
