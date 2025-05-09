import React, { useEffect, useState, useCallback, useContext } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from "react-native";
import { Button, Chip, Icon } from "@rneui/themed";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { FAB } from "@rneui/themed";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CommunityCard from "@/components/card/community_card";
import { getRequest, postRequest } from "@/helpers/api-requests";

import { Thread } from "@/constants/types/thread";
import { Tag } from "@/constants/types/tag";
import { RootStackParamList } from "@/constants/types/root-stack";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "@/context/auth-context";
import { Ionicons } from "@expo/vector-icons";
import MembershipUpgradeDialog from "@/components/dialog/membership_upgrade";
import Toast from "react-native-toast-message";
import LoadingPage from "@/components/loading/loading_page";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CommunityScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const { authState, setAuthState } = useAuth();
  const user = authState?.user;

  const [threads, setThreads] = useState<Thread[]>([]);
  const [checkingRole, setCheckingRole] = useState(true);

  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [showTags, setShowTags] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [membershipPrice, setMembershipPrice] = useState<any>();
  const [showMembershipDialog, setShowMembershipDialog] =
    useState<boolean>(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [orderBy, setOrderBy] = useState<
    "created-at-desc" | "popularity" | "friends"
  >("created-at-desc");
  const [searchTerm, setSearchTerm] = useState("");

  const handleRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    await fetchThreads(1, false);
    setRefreshing(false);
  };

  const fetchTags = async () => {
    try {
      const response = await getRequest("/tags");
      setTags(response);
    } catch (error) {
      console.error("Error fetching tags", error);
    }
  };

  const fetchMembershipPrice = async () => {
    try {
      const response = await getRequest("/prices/membership");

      setMembershipPrice(response);
    } catch (error) {
      console.error("Error fetching membership price:", error);
    }
  };

  useEffect(() => {
    if (user?.userRole === "RegisteredUser") {
      fetchMembershipPrice();
      setShowMembershipDialog(true);
    }
  }, []);

  const fetchThreads = async (page = 1, concat = false) => {
    if (page > totalPages && page !== 1) return;

    page === 1 ? setLoading(true) : setLoadingMore(true);

    try {
      const params: any = {
        statuses: "published",
        TagIds: selectedTags,
        pageNumber: page,
        pageSize,
        "order-by": orderBy,
      };

      if (searchTerm.trim()) {
        params.Search = searchTerm.trim();
      }

      if (orderBy === "friends" && user?.userId) {
        params.userId = user.userId;
      }

      const response = await getRequest(
        "/threads/filter/statuses-and-tags",
        params,
      );

      setTotalPages(response.totalPages || 1);

      if (concat) {
        setThreads((prev) => [...prev, ...response.pagedList]);
      } else {
        setThreads(response.pagedList);
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
    fetchThreads(1, false);
  }, [orderBy, selectedTags]);

  useEffect(() => {
    fetchTags();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const checkAndUpdateUserRole = async () => {
        try {
          if (!user?.userId) {
            setCheckingRole(false);
            return;
          }

          const response = await getRequest(`/users/${user.userId}/role`);
          const newRole = response;

          if (newRole && newRole !== user.userRole) {
            if (setAuthState) {
              setAuthState((prev) => ({
                ...prev,
                user: {
                  ...prev.user,
                  userRole: newRole,
                },
              }));
            }
          }
        } catch (error) {
          console.error("Lỗi khi kiểm tra role:", error);
        } finally {
          setCheckingRole(false);
        }
      };

      setCheckingRole(true);
      checkAndUpdateUserRole();
    }, [user?.userId]),
  );

  const loadMoreThreads = () => {
    if (loadingMore || currentPage >= totalPages) return;
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchThreads(nextPage, true);
  };

  const toggleTag = (tagId: number) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const handleMembershipPayment = async () => {
    if (!user?.userId) return;

    setPaymentProcessing(true);
    try {
      const response = await postRequest(
        `/payments/membership-payment/${user?.userId}`,
      );

      if (response.data) {
        if (setAuthState) {
          setAuthState((prev) => ({
            ...prev,
            user: prev.user
              ? {
                  ...prev.user,
                  userRole: "Member",
                }
              : prev.user,
          }));
        }

        Toast.show({
          type: "success",
          text1: "Nâng cấp thành công!",
          text2: `Bạn đã có thể truy cập toàn bộ cộng đồng`,
        });

        setShowMembershipDialog(false);

        fetchThreads(1, false);
      }
    } catch (error: any) {
      console.error("Error upgrading membership:", error);
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleCloseDialog = () => {
    setShowMembershipDialog(false);
  };

  const cleanAndTruncate = (html: string, maxLength = 200) => {
    if (!html) return "";
    const plainText = html
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (plainText.length <= maxLength) return plainText;
    const truncated = plainText.substring(0, maxLength);
    return truncated.slice(0, truncated.lastIndexOf(" ")) + "...";
  };

  if (checkingRole) {
    return <LoadingPage />;
  }

  return (
    <View className="bg-white flex-1 px-4 py-6">
      {user?.userRole === "Member" ? (
        <>
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row gap-2">
              <Button
                type="clear"
                title="Mới Nhất"
                titleStyle={{
                  color: orderBy === "created-at-desc" ? "#3b82f6" : "#6b7280",
                  fontWeight: orderBy === "created-at-desc" ? "bold" : "normal",
                }}
                onPress={() => {
                  setOrderBy("created-at-desc");
                  setCurrentPage(1);
                  fetchThreads(1, false);
                }}
              />
              <Button
                type="clear"
                title="Phổ Biến"
                titleStyle={{
                  color: orderBy === "popularity" ? "#3b82f6" : "#6b7280",
                  fontWeight: orderBy === "popularity" ? "bold" : "normal",
                }}
                onPress={() => {
                  setOrderBy("popularity");
                  setCurrentPage(1);
                  fetchThreads(1, false);
                }}
              />
              <Button
                type="clear"
                title="Của Bạn Bè"
                titleStyle={{
                  color: orderBy === "friends" ? "#3b82f6" : "#6b7280",
                  fontWeight: orderBy === "friends" ? "bold" : "normal",
                }}
                onPress={() => {
                  setOrderBy("friends");
                  setCurrentPage(1);
                  fetchThreads(1, false);
                }}
              />
            </View>
          </View>

          <Button
            type="clear"
            title="Bài viết của tôi"
            onPress={() => navigation.navigate("my_threads")}
            icon={<Icon name="user" type="feather" color="#333" />}
          />

          {/* Chủ Đề */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xl font-semibold text-black">Chủ Đề</Text>
            <View className="flex-row items-center space-x-2">
              <Button
                type="clear"
                onPress={() => setShowTags(!showTags)}
                icon={
                  <Icon
                    name={showTags ? "chevron-up" : "chevron-down"}
                    type="feather"
                    color="#333"
                  />
                }
              />
              <Button
                type="clear"
                onPress={() => navigation.navigate("friend_managerment")}
                icon={<Icon name="users" type="feather" color="#333" />}
              />
            </View>
          </View>

          {/* Filter tags */}
          {showTags && (
            <View className="flex-row flex-wrap gap-2 mb-4">
              {tags.map((tag) => (
                <Chip
                  key={tag.tagId}
                  title={tag.tagName}
                  onPress={() => toggleTag(tag.tagId)}
                  type={selectedTags.includes(tag.tagId) ? "solid" : "outline"}
                  color={
                    selectedTags.includes(tag.tagId) ? "primary" : "default"
                  }
                />
              ))}
            </View>
          )}

          <View className="flex-row items-center border border-gray-300 rounded-md px-3 py-2 mb-4">
            <TextInput
              placeholder="Tìm kiếm bài viết..."
              value={searchTerm}
              onChangeText={(text) => setSearchTerm(text)}
              style={{ flex: 1 }}
              returnKeyType="search"
            />
            <TouchableOpacity
              onPress={() => {
                setCurrentPage(1);
                fetchThreads(1, false);
              }}
            >
              <Ionicons name="search" size={20} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Thread list */}
          {loading && currentPage === 1 ? (
            <LoadingPage />
          ) : (
            <FlatList
              data={threads}
              keyExtractor={(item, index) => `${item.threadId}-${index}`}
              renderItem={({ item: thread }) => (
                <CommunityCard
                  key={thread.threadId}
                  threadId={thread.threadId}
                  theme={thread.threadsTags?.[0]?.tag?.tagName || "Chess"}
                  title={thread.title}
                  commentsCount={thread.commentsCount}
                  thumbnailUrl={thread.thumbnailUrl}
                  description={cleanAndTruncate(thread.content)}
                  dateTime={thread.createdAt}
                  likes={thread.likesCount || 0}
                  threadData={{
                    likes: (thread.likes || []).map((like) => ({
                      ...like,
                      threadId: thread.threadId,
                    })),
                  }}
                  createdByNavigation={{
                    ...thread.createdByNavigation,
                    username: thread.createdByNavigation.fullName
                      .replace(/\s+/g, "")
                      .toLowerCase(),
                  }}
                  tags={thread.threadsTags || []}
                />
              )}
              onEndReached={loadMoreThreads}
              onEndReachedThreshold={0.5}
              refreshing={refreshing}
              onRefresh={handleRefresh}
              ListFooterComponent={
                loadingMore ? (
                  <ActivityIndicator
                    size="small"
                    color="#000"
                    className="my-4"
                  />
                ) : null
              }
              ListEmptyComponent={
                <Text className="text-center text-gray-500 mt-12">
                  Không có bài viết nào.
                </Text>
              }
            />
          )}

          {/* FAB */}
          <FAB
            placement="right"
            icon={{ name: "plus", type: "feather", color: "white" }}
            color="#007bff"
            onPress={() => navigation.navigate("create_thread")}
          />
        </>
      ) : (
        <View className="flex-1 bg-white px-6 py-10 justify-center items-center">
          <MembershipUpgradeDialog
            open={showMembershipDialog}
            setOpen={setShowMembershipDialog}
            onClose={handleCloseDialog}
            onUpgrade={handleMembershipPayment}
            membershipPrice={membershipPrice || undefined}
            paymentProcessing={paymentProcessing}
          />

          <View className="w-full max-w-md items-center text-center">
            <Text className="text-2xl font-bold text-gray-800 mb-4 text-center">
              Bạn cần nâng cấp tài khoản để truy cập tính năng này
            </Text>

            <Text className="text-base text-gray-600 mb-8 text-center">
              Nâng cấp lên tài khoản{" "}
              <Text className="font-semibold">Member</Text> để tham gia cộng
              đồng và trải nghiệm tất cả tính năng
            </Text>

            <TouchableOpacity
              className="bg-blue-600 px-8 py-3 rounded-lg shadow-md"
              onPress={() => setShowMembershipDialog(true)}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons
                  name="arrow-up-circle-outline"
                  size={20}
                  color="white"
                />
                <Text className="text-white text-lg font-semibold ml-2">
                  Nâng cấp tài khoản
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default CommunityScreen;
