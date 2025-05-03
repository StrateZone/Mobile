import React, { useCallback, useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/constants/types/root-stack";
import { useAuth } from "@/context/auth-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Button, Card, Badge, Tab, Icon } from "@rneui/themed";
import { WebView } from "react-native-webview";
import { useWindowDimensions } from "react-native";
import { Fold } from "react-native-animated-spinkit";
import BackButton from "@/components/BackButton";
import LoadingPage from "@/components/loading/loading_page";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Thread {
  threadId: number;
  createdBy: number;
  title: string;
  thumbnailUrl: string | null;
  content: string;
  rating: number;
  likesCount: number;
  status:
    | "pending"
    | "published"
    | "rejected"
    | "deleted"
    | "hidden"
    | "drafted";
  createdAt: string;
  updatedAt: string | null;
  comments: Comment[];
  createdByNavigation: {
    userId: number;
    username: string;
    avatarUrl: string;
  };
}

interface Comment {
  commentId: number;
  content: string;
  createdAt: string;
}

export default function MyThread() {
  const navigation = useNavigation<NavigationProp>();
  const { authState } = useAuth();
  const user = authState?.user;
  const { width } = useWindowDimensions();

  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const pageSize = 4;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTab, setSelectedTab] = useState(0);

  const fetchThreads = async (page = currentPage, showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const response = await fetch(
        `https://backend-production-ac5e.up.railway.app/api/threads/user/${user?.userId}?page-number=${page}&page-size=${pageSize}`,
      );
      if (!response.ok) throw new Error("Failed to fetch threads");
      const data = await response.json();
      setThreads(data.pagedList);
    } catch (error) {
      console.error("Error fetching threads:", error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.userId) {
      fetchThreads();
    }
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    await fetchThreads(1, false);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchThreads();
    }, []),
  );

  const handleDelete = (threadId: number) => {
    Alert.alert("Xác nhận", "Bạn muốn xóa bài viết này?", [
      { text: "Hủy" },
      {
        text: "Xóa",
        onPress: async () => {
          try {
            const response = await fetch(
              `https://backend-production-ac5e.up.railway.app/api/threads/${threadId}`,
              { method: "DELETE" },
            );
            if (response.ok) {
              await fetchThreads();
            } else {
              alert("Failed to delete post");
            }
          } catch (error) {
            console.error("Error deleting thread:", error);
          }
        },
      },
    ]);
  };

  const statusColors: {
    [key: string]: { backgroundColor: string; color: string };
  } = {
    published: { backgroundColor: "#22C55E", color: "#fff" },
    pending: { backgroundColor: "#3B82F6", color: "#fff" },
    edit_pending: { backgroundColor: "#F59E0B", color: "#000" },
    rejected: { backgroundColor: "#EF4444", color: "#fff" },
    deleted: { backgroundColor: "#9CA3AF", color: "#fff" },
    hidden: { backgroundColor: "#6B7280", color: "#fff" },
    drafted: { backgroundColor: "#6B7280", color: "#fff" },
  };

  const statusTexts: { [key: string]: string } = {
    published: "Đã đăng",
    pending: "Chờ duyệt",
    edit_pending: "Chờ duyệt chỉnh sửa",
    rejected: "Bị từ chối",
    deleted: "Đã xóa",
    hidden: "Đã ẩn",
    drafted: "Nháp",
  };

  const getStatusBadge = (status: string) => {
    const { backgroundColor, color } =
      statusColors[status] || statusColors.default;
    const text = statusTexts[status] || statusTexts.default;

    return (
      <Badge
        value={text}
        badgeStyle={{
          backgroundColor,
          borderRadius: 8,
        }}
        textStyle={{
          color,
          fontWeight: "bold",
          fontSize: 12,
        }}
      />
    );
  };

  const renderHtmlContent = (html: string) => {
    const htmlContent = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              font-size: 16px;
              line-height: 1.5;
              color: #333;
              padding: 16px;
            }
            p {
              margin-bottom: 16px;
            }
            strong {
              font-weight: bold;
            }
            em {
              font-style: italic;
            }
            ul, ol {
              margin-left: 20px;
              margin-bottom: 16px;
            }
            h1, h2, h3 {
              margin-top: 24px;
              margin-bottom: 16px;
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;
    return htmlContent;
  };

  const toggleThreadVisibility = (threadId: number, status: string) => {
    const action = status === "hidden" ? "show" : "hide";
    Alert.alert(
      "Xác nhận",
      `Bạn muốn ${action === "hide" ? "ẩn" : "hiện"} bài viết này?`,
      [
        { text: "Hủy" },
        {
          text: action === "hide" ? "Ẩn" : "Hiện",
          onPress: async () => {
            try {
              const response = await fetch(
                `https://backend-production-ac5e.up.railway.app/api/threads/${action}/${threadId}`,
                { method: "PUT" },
              );
              if (response.ok) {
                await fetchThreads();
              } else {
                alert("Failed to update post visibility");
              }
            } catch (error) {
              console.error(`Error ${action} thread:`, error);
            }
          },
        },
      ],
    );
  };

  const filteredThreads = threads.filter((thread) => {
    if (selectedTab === 0) {
      return thread.status !== "drafted";
    } else {
      return thread.status === "drafted";
    }
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F4F5F7" /* neutral */ }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
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
              color: "#212529" /* neutral-900 */,
            }}
          >
            Bài viết của tôi
          </Text>
          <View style={{ width: 48 }} />
        </View>

        <Tab
          value={selectedTab}
          onChange={setSelectedTab}
          indicatorStyle={{
            backgroundColor: "#3B82F6",
            height: 3,
          }}
        >
          <Tab.Item
            title="Bài đã đăng"
            titleStyle={(active) => ({
              color: active ? "#3B82F6" : "#64748B",
              fontSize: 14,
              fontWeight: "600",
            })}
            icon={{
              name: "file-text",
              type: "feather",
              color: selectedTab === 0 ? "#3B82F6" : "#64748B",
            }}
          />
          <Tab.Item
            title="Bài nháp"
            titleStyle={(active) => ({
              color: active ? "#3B82F6" : "#64748B",
              fontSize: 14,
              fontWeight: "600",
            })}
            icon={{
              name: "edit",
              type: "feather",
              color: selectedTab === 1 ? "#3B82F6" : "#64748B",
            }}
          />
        </Tab>

        {isLoading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <LoadingPage />
            <Text style={{ marginTop: 16, color: "#64748B", fontSize: 16 }}>
              Đang tải bài viết...
            </Text>
          </View>
        ) : filteredThreads.length === 0 ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 32,
            }}
          >
            <Ionicons name="document-text-outline" size={64} color="#CBD5E1" />
            <Text
              style={{
                marginTop: 16,
                color: "#64748B",
                fontSize: 16,
                textAlign: "center",
              }}
            >
              {selectedTab === 0
                ? "Bạn chưa có bài viết nào"
                : "Bạn chưa có bản nháp nào"}
            </Text>
          </View>
        ) : (
          <ScrollView
            style={{ padding: 16 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
          >
            {filteredThreads.map((thread) => (
              <Card
                key={thread.threadId}
                containerStyle={{
                  borderRadius: 16,
                  marginBottom: 20,
                  padding: 0,
                  overflow: "hidden",
                  backgroundColor: "#FFFFFF",
                  borderWidth: 0,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <Card.Image
                  source={{
                    uri:
                      thread.thumbnailUrl ||
                      "https://cdn.pixabay.com/photo/2015/10/07/12/17/post-976115_960_720.png",
                  }}
                  style={{ width: "100%", height: 200 }}
                  resizeMode="cover"
                />

                <View style={{ padding: 16 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "600",
                        color: "#1E293B",
                        flex: 1,
                      }}
                    >
                      {thread.title}
                    </Text>

                    {(thread.status === "published" ||
                      thread.status === "hidden") && (
                      <TouchableOpacity
                        onPress={() =>
                          toggleThreadVisibility(thread.threadId, thread.status)
                        }
                        style={{
                          backgroundColor:
                            thread.status === "hidden" ? "#3B82F6" : "#64748B",
                          borderRadius: 8,
                          padding: 8,
                          marginLeft: 10,
                        }}
                      >
                        <Ionicons
                          name={thread.status === "hidden" ? "eye" : "eye-off"}
                          size={24}
                          color="white"
                        />
                      </TouchableOpacity>
                    )}
                  </View>

                  {getStatusBadge(thread.status)}

                  <View style={{ marginTop: 8 }}>
                    <Text style={{ color: "#64748B", fontSize: 14 }}>
                      Đăng lúc: {new Date(thread.createdAt).toLocaleString()}
                    </Text>
                    {thread.updatedAt && (
                      <Text style={{ color: "#64748B", fontSize: 14 }}>
                        Cập nhật: {new Date(thread.updatedAt).toLocaleString()}
                      </Text>
                    )}
                  </View>

                  <View style={{ height: 200, marginTop: 8 }}>
                    <WebView
                      source={{ html: renderHtmlContent(thread.content) }}
                      style={{ flex: 1 }}
                      scrollEnabled={false}
                    />
                  </View>

                  <View style={{ marginTop: 16, gap: 8 }}>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <Button
                        title="Chỉnh sửa"
                        onPress={() =>
                          navigation.navigate("edit_thread", { thread })
                        }
                        icon={
                          <Ionicons
                            name="create-outline"
                            size={20}
                            color="#FFFFFF"
                            style={{ marginRight: 8 }}
                          />
                        }
                        buttonStyle={{
                          backgroundColor: "#10B981",
                          borderRadius: 8,
                          paddingVertical: 12,
                          flex: 1,
                        }}
                        titleStyle={{ fontSize: 14, fontWeight: "600" }}
                      />
                      <Button
                        title="Xóa bài"
                        onPress={() => handleDelete(thread.threadId)}
                        icon={
                          <Ionicons
                            name="trash-outline"
                            size={20}
                            color="#FFFFFF"
                            style={{ marginRight: 8 }}
                          />
                        }
                        buttonStyle={{
                          backgroundColor: "#EF4444",
                          borderRadius: 8,
                          paddingVertical: 12,
                          flex: 1,
                        }}
                        titleStyle={{ fontSize: 14, fontWeight: "600" }}
                      />
                    </View>
                    {thread.status === "drafted" && (
                      <Button
                        title="Tạo từ nháp"
                        onPress={() =>
                          navigation.navigate("create_thread", {
                            draftThread: thread,
                          })
                        }
                        icon={
                          <Ionicons
                            name="document-text-outline"
                            size={20}
                            color="#FFFFFF"
                            style={{ marginRight: 8 }}
                          />
                        }
                        buttonStyle={{
                          backgroundColor: "#3B82F6",
                          borderRadius: 8,
                          paddingVertical: 12,
                        }}
                        titleStyle={{ fontSize: 14, fontWeight: "600" }}
                      />
                    )}
                  </View>
                </View>
              </Card>
            ))}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
