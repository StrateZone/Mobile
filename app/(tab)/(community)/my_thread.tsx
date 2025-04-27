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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/constants/types/root-stack";
import { useAuth } from "@/context/auth-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Button, Card, Badge } from "@rneui/themed";
import { WebView } from "react-native-webview";
import { useWindowDimensions } from "react-native";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Thread {
  threadId: number;
  createdBy: number;
  title: string;
  thumbnailUrl: string | null;
  content: string;
  rating: number;
  likesCount: number;
  status: "pending" | "published" | "rejected" | "deleted";
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
    published: { backgroundColor: "#22C55E", color: "#fff" }, // Xanh lá
    pending: { backgroundColor: "#3B82F6", color: "#fff" }, // Xanh dương
    edit_pending: { backgroundColor: "#F59E0B", color: "#000" }, // Cam vàng
    rejected: { backgroundColor: "#EF4444", color: "#fff" }, // Đỏ
    deleted: { backgroundColor: "#9CA3AF", color: "#fff" }, // Xám
    default: { backgroundColor: "#6B7280", color: "#fff" }, // Xám đậm
  };

  const statusTexts: { [key: string]: string } = {
    published: "Đã đăng",
    pending: "Chờ duyệt",
    edit_pending: "Chỉnh sửa chờ duyệt",
    rejected: "Bị từ chối",
    deleted: "Đã xóa",
    default: "Không xác định",
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

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-1 p-4 mt-10">
        <TouchableOpacity
          className="absolute left-4 top-2 p-2 bg-gray-300 rounded-full z-10"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-center text-black mb-5">
          Bài Viết Của Tôi
        </Text>

        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#000" />
          </View>
        ) : threads.length === 0 ? (
          <Text className="text-center text-gray-500">
            Không tìm thấy bài viết nào.
          </Text>
        ) : (
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
          >
            {threads.map((thread) => (
              <Card
                key={thread.threadId}
                containerStyle={{
                  borderRadius: 12,
                  marginBottom: 20,
                  padding: 0,
                  overflow: "hidden",
                }}
              >
                <Card.Image
                  source={{
                    uri:
                      thread.thumbnailUrl ||
                      "https://cdn.pixabay.com/photo/2015/10/07/12/17/post-976115_960_720.png",
                  }}
                  style={{ width: "100%", height: 180 }}
                  resizeMode="cover"
                />

                <View style={{ padding: 15 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      marginBottom: 6,
                    }}
                  >
                    {thread.title}
                  </Text>

                  {getStatusBadge(thread.status)}

                  <Text className="text-sm text-gray-500 mt-1">
                    Thời gian đăng:{" "}
                    {new Date(thread.createdAt).toLocaleString()}
                  </Text>
                  {thread.updatedAt && (
                    <Text className="text-sm text-gray-500">
                      Cập nhật: {new Date(thread.updatedAt).toLocaleString()}
                    </Text>
                  )}

                  <View style={{ height: 200, marginTop: 8 }}>
                    <WebView
                      source={{ html: renderHtmlContent(thread.content) }}
                      style={{ flex: 1 }}
                      scrollEnabled={false}
                    />
                  </View>

                  <View className="flex-row justify-between mt-10">
                    <Button
                      title="Chỉnh sửa"
                      onPress={() =>
                        navigation.navigate("edit_thread", { thread })
                      }
                      buttonStyle={{
                        backgroundColor: "#2ecc71",
                        borderRadius: 8,
                        paddingHorizontal: 20,
                        paddingVertical: 8,
                      }}
                      titleStyle={{ fontWeight: "bold" }}
                    />

                    <Button
                      title="Xóa bài"
                      onPress={() => handleDelete(thread.threadId)}
                      buttonStyle={{
                        backgroundColor: "#e74c3c",
                        borderRadius: 8,
                        paddingHorizontal: 20,
                        paddingVertical: 8,
                      }}
                      titleStyle={{ fontWeight: "bold" }}
                    />
                  </View>
                </View>
              </Card>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
