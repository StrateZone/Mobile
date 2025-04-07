import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Fold } from "react-native-animated-spinkit";

import { useAuth } from "@/context/auth-context";
import { Opponents } from "@/constants/types/opponent";
import { RootStackParamList } from "@/constants/types/root-stack";
import { getRequest, postRequest } from "@/helpers/api-requests";
import Toast from "react-native-toast-message";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ListTableRouteProp = RouteProp<RootStackParamList, "find_opponents">;

type Props = {
  route: ListTableRouteProp;
};

export default function FindOpponent({ route }: Props) {
  const { tableId, startDate, endDate } = route.params;
  const { authState } = useAuth();
  const user = authState?.user;
  const navigation = useNavigation<NavigationProp>();

  const [opponents, setOpponents] = useState<Opponents[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [excludedIds, setExcludedIds] = useState<[]>([]);

  const handleGetUserForInvite = async () => {
    setIsLoading(true);
    getRequest(`/users/by-ranking/random/${user?.userId}/table/${tableId}`, {
      StartTime: startDate,
      EndTime: endDate,
      ranking: user?.ranking,
      excludedIds,
      up: 1,
      down: 1,
    })
      .then((opponent) => {
        setOpponents(opponent.matchingOpponents);
        setExcludedIds(opponent.excludedIds);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    handleGetUserForInvite();
  }, []);

  const handleInvite = async (toUserId: number) => {
    if (!user) return;

    try {
      const payload = {
        fromUser: user.userId,
        toUser: toUserId,
        tableId,
        startTime: startDate,
        endTime: endDate,
      };

      await postRequest("/appointmentrequests", payload);

      setOpponents((prev) =>
        prev.map((opponent) =>
          opponent.userId === toUserId
            ? { ...opponent, isInvited: true }
            : opponent,
        ),
      );

      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: `Đã gửi lời mời cho đối thủ`,
      });
    } catch (error) {
      console.error("Lỗi khi gửi lời mời:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="relative">
        <TouchableOpacity
          className="absolute left-4 top-2 p-2 bg-gray-300 rounded-full z-10"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View className="flex-1 p-4 mt-10">
        <Text className="text-2xl font-bold text-center text-black mb-5">
          Tìm đối thủ
        </Text>

        <View className="mb-3 flex-row items-center justify-between px-1">
          <Text className="text-lg font-semibold text-black">
            Xem đối thủ đã mời
          </Text>
          <TouchableOpacity
            className="bg-black px-3 py-1 rounded-full"
            onPress={() =>
              navigation.navigate("opponent_invited", {
                tableId,
                startDate,
                endDate,
              })
            }
          >
            <Ionicons name="eye-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View className="mb-3 flex-row items-center justify-between px-1">
          <Text className="text-lg font-semibold text-black">
            StrateZone gọi ý
          </Text>
          <TouchableOpacity
            className="bg-black px-3 py-1 rounded-full"
            onPress={handleGetUserForInvite}
          >
            <Ionicons name="refresh" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* <TouchableOpacity
          onPress={handleGetUserForInvite}
          className="mb-5 bg-green-500 p-2 rounded-full flex-row items-center justify-center"
        >
          <Ionicons name="refresh" size={24} color="white" />
          <Text className="text-white ml-2">Tải lại danh sách đối thủ đã mời</Text>
        </TouchableOpacity> */}

        {isLoading ? (
          <View className="flex justify-center items-center mt-32">
            <Fold size={48} color="#000000" />
          </View>
        ) : (
          <FlatList
            data={opponents}
            keyExtractor={(item) => item.userId.toString()}
            renderItem={({ item }) => (
              <View className="flex-row items-center bg-white p-4 rounded-lg shadow-md mb-3 border border-gray-300">
                <Image
                  source={{
                    uri:
                      item.avatarUrl ||
                      "https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg",
                  }}
                  className="w-12 h-12 rounded-full border-2 border-blue-500 mr-3"
                />

                <View className="flex-1">
                  <Text className="text-lg font-semibold text-black">
                    {item.fullName || "Không có tên"}
                  </Text>
                  <Text className="text-gray-500">Cấp bậc: {item.ranking}</Text>
                </View>

                {item.isInvited ? (
                  <Text className="text-green-500 font-semibold">Đã mời</Text>
                ) : (
                  <TouchableOpacity
                    onPress={() => handleInvite(item.userId)}
                    className="p-2 bg-gray-200 rounded-full"
                  >
                    <Ionicons name="paper-plane" size={20} color="black" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
