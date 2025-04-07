import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Fold } from "react-native-animated-spinkit";

import { getRequest } from "@/helpers/api-requests";
import { useAuth } from "@/context/auth-context";

import { RootStackParamList } from "@/constants/types/root-stack";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ListTableRouteProp = RouteProp<RootStackParamList, "opponent_invited">;

type Props = {
  route: ListTableRouteProp;
};

export default function OpponentInvited({ route }: Props) {
  const navigation = useNavigation<NavigationProp>();
  const { authState, onUpdateUserBalance } = useAuth();
  const user = authState?.user;
  const { tableId, startDate, endDate } = route.params;

  const [opponents, setOpponents] = useState<[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    getRequest(`/appointmentrequests/users/${user?.userId}/tables/${tableId}`, {
      startTime: startDate,
      endTime: endDate,
    })
      .then((opponent) => {
        setOpponents(opponent);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  const renderOpponentItem = ({ item }: any) => {
    const opponent = item.toUserNavigation;
    return (
      <View className="flex-row items-center bg-white p-4 rounded-lg mb-4 shadow-md">
        <Image
          source={{
            uri:
              opponent.avatarUrl ||
              "https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg",
          }}
          style={{ width: 50, height: 50, borderRadius: 25, marginRight: 12 }}
        />
        <View className="flex-1">
          <Text className="text-xl font-semibold">{opponent.username}</Text>
          <Text className="text-sm text-gray-600">{opponent.email}</Text>
          <Text className="text-sm text-gray-600">{opponent.phone}</Text>
        </View>
        {/* <TouchableOpacity
              onPress={() => {
                // Handle button press, like viewing opponent details
              }}
              className="p-2 bg-blue-500 rounded-full"
            >
              <Ionicons name="chevron-forward" size={20} color="white" />
            </TouchableOpacity> */}
      </View>
    );
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
          Đối thủ đã mời cho bàn {tableId}
        </Text>

        {isLoading ? (
          <View className="flex justify-center items-center mt-32">
            <Fold size={48} color="#000000" />
          </View>
        ) : opponents.length === 0 ? (
          <Text className="text-center text-gray-500">
            Chưa có đối thủ nào mời. Vui lòng thử lại sau.
          </Text>
        ) : (
          <FlatList data={opponents} renderItem={renderOpponentItem} />
        )}
      </View>
    </SafeAreaView>
  );
}
