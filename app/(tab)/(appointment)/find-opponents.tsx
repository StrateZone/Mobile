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
import { Tab, TabView } from "@rneui/themed";

import { useAuth } from "@/context/auth-context";
import { Opponents } from "@/constants/types/opponent";
import { RootStackParamList } from "@/constants/types/root-stack";
import { getRequest } from "@/helpers/api-requests";
import Toast from "react-native-toast-message";
import { TableContext } from "@/context/select-table";
import { ChessTable } from "@/constants/types/chess_table";
import BackButton from "@/components/BackButton";
import LoadingPage from "@/components/loading/loading_page";

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
  const [index, setIndex] = useState(0);

  const [selectedTables, , , , , addInvitedUser] = useContext(TableContext);

  const [friends, setFriends] = useState<Opponents[]>([]);
  const [opponents, setOpponents] = useState<Opponents[]>([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState<boolean>(true);
  const [isLoadingOpponents, setIsLoadingOpponents] = useState<boolean>(true);
  const [excludedIds, setExcludedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [maxOpponent, setMaxOpponent] = useState<number>(0);

  useEffect(() => {
    const fetchMaxOpponents = async () => {
      const response = await getRequest(
        `/system/1/appointment-requests/max-invitations-to-table`,
      );
      setMaxOpponent(response);
    };
    fetchMaxOpponents();
  }, []);

  const handleGetFriends = async () => {
    if (user?.userRole !== "Member") return;
    setIsLoadingFriends(true);
    try {
      const response = await getRequest(`/users/opponents/${user?.userId}`, {
        StartTime: startDate,
        EndTime: endDate,
        excludedIds,
        up: 1,
        down: 1,
      });
      setFriends(response.friends || []);
      setExcludedIds(response.excludedIds || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bạn bè:", error);
    } finally {
      setIsLoadingFriends(false);
    }
  };

  const handleGetOpponents = async () => {
    setIsLoadingOpponents(true);
    try {
      const response = await getRequest(`/users/opponents/${user?.userId}`, {
        StartTime: startDate,
        EndTime: endDate,
        excludedIds,
        up: 1,
        down: 1,
        searchTerm,
      });
      setOpponents(response.matchingOpponents || []);
      setExcludedIds(response.excludedIds || []);
    } catch (error) {
      console.error("Lỗi khi lấy đối thủ:", error);
    } finally {
      setIsLoadingOpponents(false);
    }
  };

  useEffect(() => {
    handleGetFriends();
    handleGetOpponents();
  }, []);

  const handleInvite = async (toUserId: number) => {
    if (!user) return;

    const table = selectedTables.find((t: ChessTable) => t.tableId === tableId);
    const currentInvitedCount = table?.invitedUsers?.length || 0;

    if (currentInvitedCount >= maxOpponent) {
      Toast.show({
        type: "error",
        text1: "Quá giới hạn",
        text2: `Chỉ được phép mời tối đa ${maxOpponent} người`,
      });
      return;
    }

    try {
      await addInvitedUser(tableId, toUserId);

      setFriends((prev) =>
        prev.map((friend) =>
          friend.userId === toUserId ? { ...friend, isInvited: true } : friend,
        ),
      );
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
        text1: "Thất bại",
        text2: `Không thể gửi lời mời này`,
      });
    }
  };

  const isUserInvited = (userId: number) => {
    const table = selectedTables.find((t: ChessTable) => t.tableId === tableId);
    return table?.invitedUsers?.includes(userId) || false;
  };

  const renderUserList = (users: Opponents[]) => (
    <ScrollView>
      {users.map((user) => (
        <View
          key={user.userId}
          className="flex-row items-center bg-white p-4 rounded-lg shadow-md mb-3 border border-gray-300"
        >
          <Image
            source={{
              uri:
                user.avatarUrl ||
                "https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg",
            }}
            className="w-12 h-12 rounded-full border-2 border-blue-500 mr-3"
          />

          <View className="flex-1">
            <Text className="text-lg font-semibold text-black">
              {user.username || "Không có tên"}
            </Text>
            <Text className="text-gray-500">Email: {user.email}</Text>
          </View>

          {isUserInvited(user.userId) ? (
            <Text className="text-green-500 font-semibold">Đã mời</Text>
          ) : (
            <TouchableOpacity
              onPress={() => handleInvite(user.userId)}
              className="p-2 bg-gray-200 rounded-full"
            >
              <Ionicons name="paper-plane" size={20} color="black" />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="relative">
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
            Tìm đối thủ
          </Text>
          <View style={{ width: 48 }} />
        </View>

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

        {user?.userRole === "Member" ? (
          <View style={{ height: 1500 }}>
            <Tab
              value={index}
              onChange={setIndex}
              indicatorStyle={{
                height: 3,
              }}
            >
              <Tab.Item
                title="Bạn bè"
                titleStyle={(active) => ({
                  color: active ? "black" : "gray",
                })}
                icon={{ name: "people", type: "ionicon", color: "black" }}
              />
              <Tab.Item
                title="Đối thủ khác"
                titleStyle={(active) => ({
                  color: active ? "black" : "gray",
                })}
                icon={{ name: "person", type: "ionicon", color: "black" }}
              />
            </Tab>

            <TabView value={index} onChange={setIndex} animationType="spring">
              <TabView.Item style={{ width: "100%" }}>
                <View className="flex-1 p-4">
                  {isLoadingFriends ? <LoadingPage /> : renderUserList(friends)}
                </View>
              </TabView.Item>
              <TabView.Item style={{ width: "100%" }}>
                <View className="flex-1 p-4">
                  <View className="flex-row items-center bg-white rounded-full px-3 py-2 mb-4 border border-gray-300">
                    <TextInput
                      placeholder="Tìm đối thủ..."
                      value={searchTerm}
                      onChangeText={setSearchTerm}
                      className="flex-1 text-black"
                      returnKeyType="search"
                      onSubmitEditing={handleGetOpponents}
                    />
                    <TouchableOpacity onPress={handleGetOpponents}>
                      <Ionicons name="search" size={24} color="black" />
                    </TouchableOpacity>
                  </View>
                  {isLoadingOpponents ? (
                    <LoadingPage />
                  ) : (
                    renderUserList(opponents)
                  )}
                </View>
              </TabView.Item>
            </TabView>
          </View>
        ) : (
          <>
            <View className="mb-3 flex-row items-center justify-between px-1">
              <Text className="text-lg font-semibold text-black">
                StrateZone gợi ý
              </Text>
              <TouchableOpacity
                className="bg-black px-3 py-1 rounded-full"
                onPress={handleGetOpponents}
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
                onSubmitEditing={handleGetOpponents}
              />
              <TouchableOpacity onPress={handleGetOpponents}>
                <Ionicons name="search" size={24} color="black" />
              </TouchableOpacity>
            </View>
            {isLoadingOpponents ? <LoadingPage /> : renderUserList(opponents)}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
