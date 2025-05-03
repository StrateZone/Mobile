import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
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

export default function FindOpponent({ route }: Props) {
  const { tableId, startDate, endDate, tablePrice } = route.params;
  const { authState } = useAuth();
  const user = authState?.user;
  const navigation = useNavigation<NavigationProp>();

  const [selectedTables, , , , , addInvitedUser] = useContext(TableContext);

  const [opponents, setOpponents] = useState<Opponents[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [excludedIds, setExcludedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleGetUserForInvite = async () => {
    setIsLoading(true);
    try {
      const response = await getRequest(`/users/opponents/${user?.userId}`, {
        StartTime: startDate,
        EndTime: endDate,
        excludedIds,
        up: 1,
        down: 1,
        searchTerm,
      });

      if (user?.userRole === "Member") {
        const friends = response.friends.map((friend: any) => ({
          ...friend,
          // isInvited: alreadyInvitedIds.includes(friend.userId),
        }));

        const opponents = response.matchingOpponents.map((opponent: any) => ({
          ...opponent,
          // isInvited: alreadyInvitedIds.includes(opponent.userId),
        }));

        setOpponents([...friends, ...opponents]); // Gộp cả bạn bè và đối thủ
      } else {
        setOpponents(response.matchingOpponents || []); // Chỉ lấy đối thủ
      }
      setExcludedIds(response.excludedIds || []);
    } catch (error) {
      console.error("Lỗi khi lấy đối thủ:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGetUserForInvite();
  }, []);

  const handleInvite = async (toUserId: number) => {
    if (!user) return;

    const table = selectedTables.find((t: ChessTable) => t.tableId === tableId);
    const currentInvitedCount = table?.invitedUsers?.length || 0;

    if (currentInvitedCount >= 6) {
      Toast.show({
        type: "error",
        text1: "Quá giới hạn",
        text2: "Chỉ được phép mời tối đa 6 người",
      });
      return;
    }

    try {
      await addInvitedUser(tableId, toUserId);

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
      Toast.show({
        type: "error",
        text1: "Thất bạn",
        text2: `Không thể gửi lời mời này`,
      });
    }
  };

  const isUserInvited = (userId: number) => {
    const table = selectedTables.find((t: ChessTable) => t.tableId === tableId);
    return table?.invitedUsers?.includes(userId) || false;
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
            Gợi ý từ StrateZone
          </Text>
          <TouchableOpacity
            className="bg-black px-3 py-1 rounded-full"
            onPress={handleGetUserForInvite}
          >
            <Ionicons name="refresh" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center bg-white rounded-full px-3 py-2 mb-4 border border-gray-300">
          <TextInput
            placeholder="Tìm đối thủ..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            className="flex-1 text-black"
            returnKeyType="search"
            onSubmitEditing={handleGetUserForInvite}
          />
          <TouchableOpacity onPress={handleGetUserForInvite}>
            <Ionicons name="search" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View className="flex justify-center items-center mt-32">
            <Fold size={48} color="#000000" />
          </View>
        ) : (
          <ScrollView>
            {opponents.map((opponent) => (
              <View
                key={opponent.userId}
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
                  <Text className="text-gray-500">Email: {opponent.email}</Text>
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
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
