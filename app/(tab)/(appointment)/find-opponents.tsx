import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
} from "react-native";
import React, { useEffect, useState, useContext } from "react";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Fold } from "react-native-animated-spinkit";

import { useAuth } from "@/context/auth-context";
import { Opponents } from "@/constants/types/opponent";
import { RootStackParamList } from "@/constants/types/root-stack";
import { getRequest } from "@/helpers/api-requests";
import Toast from "react-native-toast-message";
import { TableContext } from "@/context/select-table";
import { ChessTable } from "@/constants/types/chess_table";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ListTableRouteProp = RouteProp<RootStackParamList, "find_opponents">;

type Props = {
  route: ListTableRouteProp;
};

type MatchingOpponents = {
  basic: Opponents[];
  silver: Opponents[];
  gold?: Opponents[];
  platinum?: Opponents[];
  diamond?: Opponents[];
};

export default function FindOpponent({ route }: Props) {
  const { tableId, startDate, endDate, tablePrice } = route.params;

  const { authState } = useAuth();
  const user = authState?.user;
  const navigation = useNavigation<NavigationProp>();

  const [
    selectedTables,
    toggleTableSelection,
    removeSelectedTable,
    clearSelectedTables,
    clearSelectedTablesWithNoInvite,
    addInvitedUser,
    removeInvitedUser,
  ] = useContext(TableContext);

  const [opponents, setOpponents] = useState<MatchingOpponents>({
    basic: [],
    silver: [],
    gold: [],
    platinum: [],
    diamond: [],
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [excludedIds, setExcludedIds] = useState<number[]>([]);

  const handleGetUserForInvite = async () => {
    setIsLoading(true);
    getRequest(`/users/by-ranking/random/${user?.userId}/tables/${tableId}`, {
      StartTime: startDate,
      EndTime: endDate,
      excludedIds,
      up: 1,
      down: 1,
    })
      .then((response) => {
        setOpponents(response.matchingOpponents);
        setExcludedIds(response.excludedIds);
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
      await addInvitedUser(tableId, toUserId);

      const updatedOpponents = { ...opponents };
      Object.keys(updatedOpponents).forEach((rank) => {
        const currentRank = rank as keyof MatchingOpponents;
        if (updatedOpponents[currentRank]) {
          updatedOpponents[currentRank] =
            updatedOpponents[currentRank]?.map((opponent) =>
              opponent.userId === toUserId
                ? { ...opponent, isInvited: true }
                : opponent,
            ) || [];
        }
      });
      setOpponents(updatedOpponents);

      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: `Đã gửi lời mời cho đối thủ`,
      });
    } catch (error) {
      console.error("Lỗi khi gửi lời mời:", error);
    }
  };

  const isUserInvited = (userId: number) => {
    const table = selectedTables.find((t: ChessTable) => t.tableId === tableId);
    return table?.invitedUsers?.includes(userId) || false;
  };

  const renderOpponentList = (rank: string, opponents: Opponents[]) => {
    if (!opponents.length) return null;

    return (
      <View key={rank} className="mb-4">
        <Text className="text-lg font-semibold text-black mb-2">
          Cấp bậc {rank.charAt(0).toUpperCase() + rank.slice(1)}
        </Text>
        {opponents.map((opponent) => (
          <View
            key={`${rank}-${opponent.userId}`}
            className="flex-row items-center bg-white p-4 rounded-lg shadow-md mb-3 border border-gray-300"
          >
            <Image
              source={{
                uri:
                  opponent.avatarUrl ||
                  "https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg",
              }}
              className="w-12 h-12 rounded-full border-2 border-blue-500 mr-3"
            />

            <View className="flex-1">
              <Text className="text-lg font-semibold text-black">
                {opponent.fullName || "Không có tên"}
              </Text>
              <Text className="text-gray-500">Cấp bậc: {opponent.ranking}</Text>
            </View>

            {isUserInvited(opponent.userId) ? (
              <Text className="text-green-500 font-semibold">Đã mời</Text>
            ) : (
              <TouchableOpacity
                onPress={() => handleInvite(opponent.userId)}
                className="p-2 bg-gray-200 rounded-full"
              >
                <Ionicons name="paper-plane" size={20} color="black" />
              </TouchableOpacity>
            )}
          </View>
        ))}
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

        {isLoading ? (
          <View className="flex justify-center items-center mt-32">
            <Fold size={48} color="#000000" />
          </View>
        ) : (
          <ScrollView>
            {Object.entries(opponents).map(([rank, opponents]) =>
              renderOpponentList(rank, opponents),
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
