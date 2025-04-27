import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { Avatar, Button, Tab, TabView, Card } from "@rneui/themed";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/auth-context";
import {
  deleteRequest,
  getRequest,
  postRequest,
  putRequest,
} from "@/helpers/api-requests";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/constants/types/root-stack";
import { Fold } from "react-native-animated-spinkit";
import { Input, Icon } from "@rneui/themed";
import FriendCard from "@/components/card/friend_card";
import LoadingButton from "@/components/button/loading_button";

export default function FriendManagementScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { authState } = useAuth();
  const userId = authState?.user?.userId;

  const [index, setIndex] = useState(0);
  const [friendList, setFriendList] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshingFriends, setRefreshingFriends] = useState(false);
  const [refreshingRequests, setRefreshingRequests] = useState(false);
  const [refreshingSearch, setRefreshingSearch] = useState(false);
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});

  const fetchFriends = async () => {
    try {
      setIsLoading(true);
      const res = await getRequest(`/friendlists/user/${userId}`);
      setFriendList(res.pagedList || []);
    } catch {
      Alert.alert("Lỗi", "Không thể tải danh sách bạn bè");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const res = await getRequest(`/friendrequests/to/${userId}`);
      setFriendRequests(res.pagedList || []);
    } catch {
      Alert.alert("Lỗi", "Không thể tải yêu cầu kết bạn");
    }
  };

  const setLoading = (key: string, value: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [key]: value }));
  };

  const removeFriend = async (id: number, name: string) => {
    if (!userId) return;
    setLoading(`remove_${id}`, true);
    try {
      await deleteRequest(`/friendlists/${id}`);
      await fetchFriends();
      Toast.show({ type: "success", text1: `Đã xóa bạn với ${name}` });
    } catch {
      Toast.show({
        type: "error",
        text1: "Có lỗi xảy ra trong quá trình hủy kết bạn",
      });
    } finally {
      setLoading(`remove_${id}`, false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    try {
      setIsLoading(true);
      const res = await getRequest(`/users/${userId}/search-friends`, {
        username: searchTerm,
      });

      setSearchResults(res.pagedList || []);
    } catch {
      Alert.alert("Lỗi", "Không tìm thấy người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  const acceptFriend = async (id: number) => {
    setLoading(`accept_${id}`, true);
    try {
      await putRequest(`/friendrequests/accept/${id}`, {});
      Toast.show({ type: "success", text1: "Đã chấp nhận lời mời kết bạn" });
      await fetchFriendRequests();
      await fetchFriends();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Chấp nhận thất bại",
        text2: error?.response?.data?.message || "Có lỗi xảy ra",
      });
    } finally {
      setLoading(`accept_${id}`, false);
    }
  };

  const rejectFriend = async (id: number) => {
    setLoading(`reject_${id}`, true);
    try {
      await putRequest(`/friendrequests/reject/${id}`, {});
      Toast.show({ type: "success", text1: "Đã từ chối lời mời kết bạn" });
      await fetchFriendRequests();
      await fetchFriends();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Từ chối thất bại",
        text2: error?.response?.data?.message || "Có lỗi xảy ra",
      });
    } finally {
      setLoading(`reject_${id}`, false);
    }
  };

  const sendFriendRequest = async (targetUserId: number) => {
    if (!userId) return;
    setLoading(`send_${targetUserId}`, true);

    try {
      const response = await postRequest(`/friendrequests`, {
        fromUser: userId,
        toUser: targetUserId,
      });

      if (response.status === 201) {
        Toast.show({
          type: "success",
          text1: "Thành công",
          text2: "Đã gửi lời mời kết bạn",
        });
        await handleSearch();
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Từ chối thất bại",
        text2: "Không thể gửi lời mời này",
      });
    } finally {
      setLoading(`send_${targetUserId}`, false);
    }
  };

  const cancelFriendRequest = async (receiverId: number) => {
    if (!userId) return;
    setLoading(`cancel_${receiverId}`, true);

    try {
      const response = await deleteRequest(
        `/friendrequests/sender/${userId}/receiver/${receiverId}`,
      );

      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Đã gửi hủy kết bạn",
      });

      await handleSearch();
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Từ chối thất bại",
        text2: "Không thể hủy lời mời này",
      });
    } finally {
      setLoading(`cancel_${receiverId}`, false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchFriends();
      fetchFriendRequests();
    }
  }, [userId]);

  const onRefreshFriends = async () => {
    setRefreshingFriends(true);
    await fetchFriends();
    setRefreshingFriends(false);
  };

  const onRefreshRequests = async () => {
    setRefreshingRequests(true);
    await fetchFriendRequests();
    setRefreshingRequests(false);
  };

  const onRefreshSearch = async () => {
    if (!searchTerm.trim()) return;
    setRefreshingSearch(true);
    await handleSearch();
    setRefreshingSearch(false);
  };

  const pendingRequests = friendRequests.filter(
    (request) => request.status === "pending",
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 p-4 mt-10">
        <TouchableOpacity
          className="absolute left-4 top-2 p-2 bg-gray-200 rounded-full z-10"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-center text-black mb-5">
          Bạn bè
        </Text>

        <Tab
          value={index}
          onChange={setIndex}
          indicatorStyle={{ backgroundColor: "black", height: 3 }}
        >
          <Tab.Item title="Bạn bè" titleStyle={{ fontSize: 14 }} />
          <Tab.Item title="Yêu cầu" titleStyle={{ fontSize: 14 }} />
          <Tab.Item title="Tìm kiếm" titleStyle={{ fontSize: 14 }} />
        </Tab>

        <TabView value={index} onChange={setIndex} animationType="spring">
          <TabView.Item style={{ width: "100%" }}>
            <ScrollView
              className="p-2"
              refreshControl={
                <RefreshControl
                  refreshing={refreshingFriends}
                  onRefresh={onRefreshFriends}
                />
              }
            >
              {isLoading ? (
                <View className="items-center justify-center mt-8">
                  <Fold size={40} color="#000" />
                </View>
              ) : friendList.length === 0 ? (
                <Text className="text-gray-500 italic text-center">
                  Bạn chưa có bạn bè nào
                </Text>
              ) : (
                friendList.map((item: any) => (
                  <FriendCard
                    key={item.id}
                    user={item.friend}
                    buttons={
                      <>
                        <LoadingButton
                          title="Xem thông tin"
                          onPress={() => {
                            navigation.navigate("friend_detail", {
                              friendId: item.friend?.userId,
                            });
                          }}
                          buttonStyle={{
                            backgroundColor: "#3b82f6",
                            borderRadius: 10,
                            paddingHorizontal: 16,
                          }}
                          titleStyle={{ fontSize: 14 }}
                        />
                        <LoadingButton
                          title="Xóa bạn"
                          onPress={() =>
                            removeFriend(item.id, item.friend?.username)
                          }
                          isLoading={loadingStates[`remove_${item.id}`]}
                          buttonStyle={{
                            backgroundColor: "#ef4444",
                            borderRadius: 10,
                            paddingHorizontal: 16,
                          }}
                          titleStyle={{ fontSize: 14 }}
                        />
                      </>
                    }
                  />
                ))
              )}
            </ScrollView>
          </TabView.Item>

          <TabView.Item style={{ width: "100%" }}>
            <ScrollView
              className="p-2"
              refreshControl={
                <RefreshControl
                  refreshing={refreshingRequests}
                  onRefresh={onRefreshRequests}
                />
              }
            >
              {isLoading ? (
                <View className="items-center justify-center mt-8">
                  <Fold size={40} color="#000" />
                </View>
              ) : pendingRequests.length === 0 ? (
                <Text className="text-gray-500 italic text-center">
                  Không có yêu cầu nào
                </Text>
              ) : (
                pendingRequests.map((req: any) => (
                  <FriendCard
                    key={req.id}
                    user={req.fromUserNavigation}
                    createdAt={req.createdAt}
                    buttons={
                      <>
                        <LoadingButton
                          title="Chấp nhận"
                          onPress={() => acceptFriend(req.id)}
                          isLoading={loadingStates[`accept_${req.id}`]}
                          buttonStyle={{
                            backgroundColor: "#3b82f6",
                            borderRadius: 10,
                            paddingHorizontal: 16,
                          }}
                          titleStyle={{ fontSize: 14 }}
                        />
                        <LoadingButton
                          title="Từ chối"
                          onPress={() => rejectFriend(req.id)}
                          isLoading={loadingStates[`reject_${req.id}`]}
                          buttonStyle={{
                            backgroundColor: "#ef4444",
                            borderRadius: 10,
                            paddingHorizontal: 16,
                          }}
                          titleStyle={{ fontSize: 14 }}
                        />
                      </>
                    }
                  />
                ))
              )}
            </ScrollView>
          </TabView.Item>

          <TabView.Item style={{ width: "100%" }}>
            <ScrollView
              className="p-2"
              refreshControl={
                <RefreshControl
                  refreshing={refreshingSearch}
                  onRefresh={onRefreshSearch}
                />
              }
            >
              <View className="flex-row items-center mb-4 px-2">
                <TextInput
                  className="flex-1 bg-white px-4 py-2 rounded-lg shadow-md text-black"
                  placeholder="Tìm người dùng..."
                  placeholderTextColor="#999"
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  onSubmitEditing={handleSearch}
                />
                <TouchableOpacity
                  onPress={handleSearch}
                  className="ml-2 p-2 bg-black rounded-lg"
                >
                  <Ionicons name="search" size={20} color="white" />
                </TouchableOpacity>
              </View>

              {isLoading ? (
                <View className="items-center justify-center mt-8">
                  <Fold size={40} color="#000" />
                </View>
              ) : searchResults.length === 0 ? (
                <Text className="text-gray-500 italic text-center">
                  Không có kết quả
                </Text>
              ) : (
                searchResults.map((user: any) => (
                  <FriendCard
                    key={user.userId}
                    user={user}
                    buttons={
                      <>
                        <LoadingButton
                          title="Xem thông tin"
                          onPress={() => {
                            // navigation.navigate("FriendDetailScreen", { friendId: user.userId });
                          }}
                          buttonStyle={{
                            backgroundColor: "#ffffff",
                            borderRadius: 10,
                            paddingHorizontal: 16,
                            borderWidth: 1,
                            borderColor: "#9ca3af",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          titleStyle={{
                            fontSize: 14,
                            color: "#6b7280",
                          }}
                        />

                        {user.friendStatus === 1 ? (
                          <LoadingButton
                            title="Hủy yêu cầu"
                            onPress={() => cancelFriendRequest(user.userId)}
                            isLoading={loadingStates[`cancel_${user.userId}`]}
                            buttonStyle={{
                              backgroundColor: "#ef4444",
                              borderRadius: 10,
                              paddingHorizontal: 16,
                            }}
                            titleStyle={{ fontSize: 14 }}
                          />
                        ) : (
                          <LoadingButton
                            title="Thêm bạn bè"
                            onPress={() => sendFriendRequest(user.userId)}
                            isLoading={loadingStates[`send_${user.userId}`]}
                            buttonStyle={{
                              backgroundColor: "#3b82f6",
                              borderRadius: 10,
                              paddingHorizontal: 16,
                            }}
                            titleStyle={{ fontSize: 14 }}
                          />
                        )}
                      </>
                    }
                  />
                ))
              )}
            </ScrollView>
          </TabView.Item>
        </TabView>
      </View>
    </SafeAreaView>
  );
}
