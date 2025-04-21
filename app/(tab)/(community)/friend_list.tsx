import { View, Text, FlatList, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/constants/types/root-stack";

import { Opponents } from "@/constants/types/opponent";
import FriendCard from "@/components/card/friend_card";
import { getRequest } from "@/helpers/api-requests";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function FriendList() {
  const navigation = useNavigation<NavigationProp>();

  const [user, setUser] = useState<Opponents>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUser = async (page = 1, concat = false) => {
    if (page > totalPages && page !== 1) return;

    page === 1 ? setLoading(true) : setLoadingMore(true);

    try {
      const response = await getRequest("/users/all", {
        "page-number": page,
        "page-size": pageSize,
      });

      setTotalPages(response.totalPages || 1);

      if (concat) {
        setUser((prev) => [...prev, ...response.pagedList]);
      } else {
        setUser(response.pagedList);
      }
    } catch (error) {
      console.error("Error fetching threads", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchUser(1, false);
  }, []);

  const handleAddFriend = (user: Opponents) => {
    alert(`Đã gửi lời mời kết bạn tới ${user.username}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-4">
        {/* Nút Back */}
        <TouchableOpacity
          className="absolute left-4 top-2 p-2 bg-gray-300 rounded-full z-10"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <Text className="text-xl font-bold text-center mb-6 mt-10">
          Tìm kiếm bạn bè
        </Text>

        <FlatList
          data={user}
          keyExtractor={(item) => item.userId.toString()}
          renderItem={({ item }) => (
            <FriendCard
              user={item}
              isFriend={item.id % 2 === 0}
              onAddFriend={() => handleAddFriend(item)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      </View>
    </SafeAreaView>
  );
}
