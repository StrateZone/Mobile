import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator as RNActivityIndicator,
  TextInput,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Avatar,
  Card,
  Chip,
  Divider,
  Icon,
  Image,
  Button,
} from "@rneui/themed";
import { Ionicons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";

import { RootStackParamList } from "@/constants/types/root-stack";
import { deleteRequest, getRequest, postRequest } from "@/helpers/api-requests";
import { Thread } from "@/constants/types/thread";
import { useAuth } from "@/context/auth-context";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ListTableRouteProp = RouteProp<RootStackParamList, "community_detail">;
type Props = { route: ListTableRouteProp };

const tagColors = {
  "cờ vua": "#1f2937",
  "cờ tướng": "#b91c1c",
  "cờ vây": "#facc15",
  "chiến thuật": "#2563eb",
  gambit: "#4f46e5",
  mẹo: "#8b5cf6",
  "thảo luận": "#16a34a",
  "trò chuyện": "#14b8a6",
  "ngoài lề": "#ec4899",
  "thông báo": "#f97316",
  "quan trọng": "#dc2626",
  default: "#6b7280",
};

export default function CommunityDetail({ route }: Props) {
  const navigation = useNavigation<NavigationProp>();
  const { threadId } = route.params;
  const { authState } = useAuth();
  const user = authState?.user;

  const [thread, setThread] = useState<Thread | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeId, setLikeId] = useState<number | undefined>(undefined);
  const [currentUser, setCurrentUser] = useState({
    userId: 0,
    fullName: "",
    avatarUrl: "",
  });
  const [mainCommentContent, setMainCommentContent] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [replyToCommentId, setReplyToCommentId] = useState<number | null>(null);
  const [replyingToName, setReplyingToName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [replying, setReplying] = useState<{
    commentId: number;
    userName: string;
  } | null>(null);

  const handleCommentClick = () => {
    setCommenting(true);
    setReplying(null);
  };

  const handleReplyClick = (commentId: number, userName: string) => {
    setReplying({ commentId, userName });
    setCommenting(true);
  };

  const handleCancelReply = () => {
    setReplying(null);
    setCommenting(false);
  };

  const fetchThread = async () => {
    setLoading(true);
    try {
      const response = await getRequest(`/threads/${threadId}`);
      setThread(response);
      setLikeCount(response.likes?.length || 0);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu thread:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchThread();
  }, []);

  useEffect(() => {
    if (user) {
      setCurrentUser({
        userId: user.userId || 0,
        fullName: user.fullName || "",
        avatarUrl: user.avatarUrl || "",
      });
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchThread();
    setRefreshing(false);
  };

  useEffect(() => {
    if (thread?.likes && currentUser.userId) {
      const userLike = thread.likes.find(
        (like) => like.userId === currentUser.userId,
      );
      setIsLiked(!!userLike);
      setLikeId(userLike?.id);
    }
  }, [thread, currentUser.userId]);

  const handleLike = async () => {
    if (loading || !threadId || !currentUser.userId) return;
    setLoading(true);
    try {
      if (isLiked && likeId) {
        await deleteRequest(`/likes/${likeId}`);
        setIsLiked(false);
        setLikeCount((prev) => prev - 1);
        setLikeId(undefined);
      } else {
        const response = await postRequest(`/likes`, {
          userId: currentUser.userId,
          threadId,
        });
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
        setLikeId(response.data.id);
      }
    } catch (err) {
      console.error("Like error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!currentUser.userId || submitting) return;
    const isReply = replyToCommentId !== null;
    const content = isReply ? replyContent : mainCommentContent;

    if (!content.trim()) return;

    setSubmitting(true);
    try {
      await postRequest("/comments", {
        threadId,
        userId: currentUser.userId,
        content,
        replyTo: replyToCommentId,
      });

      setMainCommentContent("");
      setReplyContent("");
      setReplyToCommentId(null);
      setReplyingToName(null);

      const response = await getRequest(`/threads/${threadId}`);
      setThread(response);
    } catch (err) {
      console.error("Gửi bình luận lỗi:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = (commentId: number, userName: string) => {
    setReplyToCommentId(commentId);
    setReplyingToName(userName);
  };

  const cancelReply = () => {
    setReplyToCommentId(null);
    setReplyingToName(null);
    setReplyContent("");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 p-4 mt-10">
        <TouchableOpacity
          className="absolute left-4 p-2 bg-gray-300 rounded-full z-10"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        {thread ? (
          <ScrollView
            className="px-4"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <Card containerStyle={{ borderRadius: 12, paddingBottom: 12 }}>
              {/* Tác giả */}
              <View className="flex-row items-center mb-8">
                <Avatar
                  rounded
                  size={40}
                  source={{
                    uri: thread.createdByNavigation?.avatarUrl || undefined,
                  }}
                />
                <View className="ml-3">
                  <Text className="text-base font-semibold">
                    {thread.createdByNavigation?.fullName}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {new Date(thread.createdAt).toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Tag */}
              <View className="flex-row flex-wrap mb-4">
                {thread.threadsTags!.map((item) => {
                  const tag = item.tag?.tagName?.toLowerCase() || "default";
                  return (
                    <Chip
                      key={item.id}
                      title={item!.tag!.tagName}
                      containerStyle={{ marginRight: 8, marginBottom: 8 }}
                      buttonStyle={{
                        backgroundColor: tagColors[tag] || tagColors.default,
                      }}
                      titleStyle={{
                        color: tag === "cờ vây" ? "black" : "white",
                      }}
                    />
                  );
                })}
              </View>

              {/* Tiêu đề */}
              <Text className="text-xl font-bold mb-3">{thread.title}</Text>

              {/* Ảnh */}
              {thread.thumbnailUrl && (
                <Image
                  source={{ uri: thread.thumbnailUrl }}
                  containerStyle={{ borderRadius: 12, marginBottom: 12 }}
                  style={{ width: "100%", height: 200 }}
                />
              )}

              {/* Nội dung */}
              <Text className="text-base text-gray-800 leading-6 mb-4">
                {thread.content}
              </Text>

              {/* Like */}
              <Button
                type={isLiked ? "solid" : "outline"}
                icon={{
                  name: "heart",
                  type: "feather",
                  color: isLiked ? "white" : "red",
                }}
                title={`${likeCount}`}
                onPress={handleLike}
                loading={loading}
                buttonStyle={{
                  borderColor: "red",
                  backgroundColor: isLiked ? "red" : "white",
                }}
                titleStyle={{ color: isLiked ? "white" : "red" }}
                containerStyle={{ alignSelf: "flex-start", borderRadius: 8 }}
              />
            </Card>

            {/* Bình luận */}
            <Text className="text-lg font-semibold mt-4 mb-2">Bình luận</Text>
            {/* Ô nhập bình luận */}
            <View className="mt-4 px-2">
              {replyingToName && (
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-sm text-gray-500 italic">
                    Đang trả lời {replyingToName}
                  </Text>
                  <TouchableOpacity onPress={cancelReply}>
                    <Text className="text-xs text-red-500">Hủy</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <View className="bg-gray-100 rounded-xl flex-row items-center px-3 py-2">
              <TextInput
                placeholder="Nhập bình luận..."
                multiline
                value={replyToCommentId ? replyContent : mainCommentContent}
                onChangeText={(text) =>
                  replyToCommentId
                    ? setReplyContent(text)
                    : setMainCommentContent(text)
                }
                className="flex-1 text-base text-gray-800 pr-2"
              />
              <TouchableOpacity
                onPress={handleSubmitComment}
                disabled={
                  submitting ||
                  !(replyToCommentId
                    ? replyContent.trim()
                    : mainCommentContent.trim())
                }
              >
                <Feather
                  name="send"
                  size={20}
                  color={
                    submitting ||
                    !(replyToCommentId
                      ? replyContent.trim()
                      : mainCommentContent.trim())
                      ? "#ccc"
                      : "#007AFF"
                  }
                />
              </TouchableOpacity>
            </View>

            {renderComments(thread.comments, handleReply)}
          </ScrollView>
        ) : (
          <View className="flex-1 justify-center items-center">
            <RNActivityIndicator size="large" color="black" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const renderComments = (
  comments: any[],
  handleReply: (commentId: number, userName: string) => void,
) => {
  const parentComments = comments.filter((c) => c.replyTo === null);

  return parentComments.map((parent) => {
    const replies = comments.filter((c) => c.replyTo === parent.commentId);

    return (
      <View key={parent.commentId} style={{ marginBottom: 24 }}>
        {/* Comment chính */}
        <Card containerStyle={{ padding: 12, borderRadius: 8 }}>
          <View className="flex-row items-start space-x-2">
            <Avatar size={28} rounded source={{ uri: parent.user.avatarUrl }} />
            <View style={{ flex: 1 }}>
              <Text className="text-sm font-semibold">
                {parent.user.fullName}
              </Text>
              <Text className="text-sm text-gray-800">{parent.content}</Text>
              <View className="flex-row items-center mt-1 space-x-2">
                <Icon name="heart" type="feather" color="gray" size={16} />
                <Text className="text-xs text-gray-500">
                  {parent.likesCount} thích
                </Text>
              </View>
            </View>
          </View>
          {/* Nút trả lời */}
          <Text
            className="text-xs text-blue-500 mt-2"
            onPress={() => handleReply(parent.commentId, parent.user.fullName)}
          >
            Trả lời
          </Text>
        </Card>

        {/* Nhóm các reply */}
        {replies.length > 0 && (
          <View
            style={{
              marginLeft: 20,
              borderLeftWidth: 2,
              borderLeftColor: "#d1d5db",
              paddingLeft: 12,
              marginTop: 8,
            }}
          >
            {replies.map((reply) => {
              const repliedTo = comments.find(
                (c) => c.commentId === reply.replyTo,
              );
              const repliedToName = repliedTo?.user?.fullName || "ai đó";

              return (
                <Card
                  key={reply.commentId}
                  containerStyle={{
                    marginBottom: 12,
                    padding: 12,
                    borderRadius: 8,
                  }}
                >
                  <View className="flex-row items-start space-x-2">
                    <Avatar
                      size={28}
                      rounded
                      source={{ uri: reply.user.avatarUrl }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text className="text-sm font-semibold">
                        {reply.user.fullName}
                      </Text>
                      <Text className="text-xs text-gray-500 italic">
                        Trả lời {repliedToName}
                      </Text>
                      <Text className="text-sm text-gray-800">
                        {reply.content}
                      </Text>
                      <View className="flex-row items-center mt-1 space-x-2">
                        <Icon
                          name="heart"
                          type="feather"
                          color="gray"
                          size={16}
                        />
                        <Text className="text-xs text-gray-500">
                          {reply.likesCount} thích
                        </Text>
                      </View>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </View>
    );
  });
};
