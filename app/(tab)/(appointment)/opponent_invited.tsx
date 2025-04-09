import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Image,
} from "react-native";
import React, { useEffect, useState, useContext } from "react";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Fold } from "react-native-animated-spinkit";
import Toast from "react-native-toast-message";

import { getRequest } from "@/helpers/api-requests";
import { useAuth } from "@/context/auth-context";
import { TableContext } from "@/context/select-table";
import { RootStackParamList } from "@/constants/types/root-stack";
import { ChessTable } from "@/constants/types/chess_table";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ListTableRouteProp = RouteProp<RootStackParamList, "opponent_invited">;

type Props = {
  route: ListTableRouteProp;
};

export default function OpponentInvited({ route }: Props) {
  const navigation = useNavigation<NavigationProp>();
  const { authState } = useAuth();
  const user = authState?.user;
  const { tableId, startDate, endDate } = route.params;

  const [
    selectedTables,
    toggleTableSelection,
    removeSelectedTable,
    clearSelectedTables,
    clearSelectedTablesWithNoInvite,
    addInvitedUser,
    removeInvitedUser,
  ] = useContext(TableContext);

  const [opponents, setOpponents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchInvitedUsers = async () => {
      setIsLoading(true);
      try {
        const table = selectedTables.find(
          (t: ChessTable) => t.tableId === tableId,
        );
        if (!table?.invitedUsers?.length) {
          setOpponents([]);
          setIsLoading(false);
          return;
        }

        const userDetails = await Promise.all(
          table.invitedUsers.map(async (userId: number) => {
            try {
              const response = await getRequest(`/users/${userId}`);
              return response;
            } catch (error) {
              console.error(`Error fetching user ${userId}:`, error);
              return null;
            }
          }),
        );

        setOpponents(userDetails.filter(Boolean));
      } catch (error) {
        console.error("Error fetching invited users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvitedUsers();
  }, [selectedTables, tableId]);

  const handleRemoveInvite = async (userId: number) => {
    try {
      await removeInvitedUser(tableId, userId);
      setOpponents((prev) =>
        prev.filter((opponent) => opponent.userId !== userId),
      );

      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Đã hủy lời mời",
      });
    } catch (error) {
      console.error("Error removing invite:", error);
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
          Đối thủ đã mời cho bàn {tableId}
        </Text>

        {isLoading ? (
          <View className="flex justify-center items-center mt-32">
            <Fold size={48} color="#000000" />
          </View>
        ) : opponents.length === 0 ? (
          <Text className="text-center text-gray-500">
            Chưa có đối thủ nào được mời.
          </Text>
        ) : (
          <FlatList
            data={opponents}
            keyExtractor={(item) => item.userId.toString()}
            renderItem={({ item }) => (
              <View className="flex-row items-center bg-white p-4 rounded-lg mb-4 shadow-md">
                <Image
                  source={{
                    uri:
                      item.avatarUrl ||
                      "https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg",
                  }}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    marginRight: 12,
                  }}
                />
                <View className="flex-1">
                  <Text className="text-xl font-semibold">{item.fullName}</Text>
                  <Text className="text-sm text-gray-600">{item.email}</Text>
                  <Text className="text-sm text-gray-600">
                    Cấp bậc: {item.ranking}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemoveInvite(item.userId)}
                  className="p-2 bg-red-100 rounded-full"
                >
                  <Ionicons name="close" size={20} color="red" />
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
