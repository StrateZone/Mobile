import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { RootStackParamList } from "@/constants/types/root-stack";
import { Ionicons } from "@expo/vector-icons";
import { deleteRequest, getRequest, postRequest } from "@/helpers/api-requests";
import { Avatar, Chip, Divider, Icon, Image } from "@rneui/themed";
import { Thread } from "@/constants/types/thread";
import { ActivityIndicator } from "react-native";
import { useAuth } from "@/context/auth-context";

const buttonColors: { [key: string]: string } = {
  "cờ vua": "bg-gray-900 text-white",
  "cờ tướng": "bg-red-700 text-white",
  "cờ vây": "bg-yellow-600 text-black",
  "chiến thuật": "bg-blue-600 text-white",
  gambit: "bg-indigo-600 text-white",
  mẹo: "bg-purple-500 text-white",
  "thảo luận": "bg-green-600 text-white",
  "trò chuyện": "bg-teal-500 text-white",
  "ngoài lề": "bg-pink-500 text-white",
  "thông báo": "bg-orange-500 text-white",
  "quan trọng": "bg-red-600 text-white",
  default: "bg-gray-500 text-white",
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ListTableRouteProp = RouteProp<RootStackParamList, "community_detail">;

type Props = {
  route: ListTableRouteProp;
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

  useEffect(() => {
    const fetchThread = async () => {
      try {
        setLoading(true);
        const response = await getRequest(`/threads/${threadId}`);
        setThread(response);
        setLikeCount(response.likes?.length || 0);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu thread:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchThread();
  }, []);

  useEffect(() => {
    if (user) {
      try {
        setCurrentUser({
          userId: user.userId || 0,
          fullName: user.fullName || "",
          avatarUrl: user.avatarUrl || "",
        });
      } catch (err) {
        console.error("Error parsing authData", err);
      }
    }
  }, []);

  useEffect(() => {
    if (thread?.likes && currentUser.userId) {
      const userLike = thread?.likes.find(
        (like) =>
          like.userId === currentUser.userId && like.threadId === threadId,
      );

      setIsLiked(!!userLike);
      setLikeId(userLike?.id);
    }
  }, [thread, currentUser.userId, thread?.likes]);

  const handleLike = async (e: any) => {
    e.stopPropagation?.();
    if (loading || !threadId || !currentUser.userId) return;
    setLoading(true);
    try {
      if (isLiked && likeId) {
        await deleteRequest(`/likes/${likeId}`, {});

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

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="relative p-2">
        <TouchableOpacity
          className="absolute left-0 top-0 z-10 p-2"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      </View>
      {thread ? (
        <ScrollView className="px-4 pt-10 pb-16 mt-10">
          {/* Avatar + tên tác giả */}
          <View className="flex-row items-center space-x-3 mb-3">
            <Avatar
              rounded
              size={40}
              source={{
                uri: "https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg",
              }}
            />
            <View>
              <Text className="text-base font-semibold">
                {thread!.createdByNavigation.fullName || "a"}
              </Text>

              <Text className="text-xs text-gray-500">
                {new Date(thread!.createdAt).toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Tags */}
          <View className="flex-row flex-wrap mb-4">
            {thread!.threadsTags!.map((tagItem: any) => {
              const tagName = tagItem.tag?.tagName?.toLowerCase() || "";
              const className = buttonColors[tagName] || buttonColors.default;

              return (
                <View
                  key={tagItem.id}
                  className={`px-3 py-1 mr-2 mb-2 rounded-full ${className}`}
                >
                  <Text className="text-md font-semibold">
                    {tagItem.tag?.tagName}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Tiêu đề */}
          <Text className="text-xl font-bold mb-3">{thread!.title}</Text>

          {/* Thumbnail */}
          {thread!.thumbnailUrl && (
            <Image
              source={{ uri: thread!.thumbnailUrl }}
              className="w-full h-48 rounded-xl mb-4"
              resizeMode="cover"
            />
          )}

          {/* Nội dung */}
          <Text className="text-base text-gray-800 leading-6 mb-4">
            {thread!.content}
          </Text>

          <TouchableOpacity
            onPress={handleLike}
            disabled={loading}
            className={`self-start flex-row items-center px-3 py-1 rounded border ${
              isLiked ? "border-red-400 bg-red-50" : "border-gray-300"
            }`}
          >
            {loading ? (
              <ActivityIndicator size="small" color="red" />
            ) : (
              <>
                <Text className="text-red-500 mr-1">❤️</Text>
                <Text className="text-sm text-red-500">{likeCount}</Text>
              </>
            )}
          </TouchableOpacity>
          <Divider />

          {/* Comments */}
          <Text className="text-lg font-semibold mt-4 mb-2">Bình luận</Text>
          {renderComments(thread!.comments)}
        </ScrollView>
      ) : (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="black" />
        </View>
      )}
    </SafeAreaView>
  );
}

const renderComments = (comments: any[], parentId: number | null = null) => {
  return comments
    .filter((comment) => comment.replyTo === parentId)
    .map((comment) => {
      const isReply = parentId !== null;

      return (
        <View
          key={comment.commentId}
          style={{
            paddingLeft: isReply ? 12 : 0,
            borderLeftWidth: isReply ? 1 : 0,
            borderLeftColor: isReply ? "#d1d5db" : "transparent",
            marginLeft: isReply ? 8 : 0,
          }}
          className="mb-4"
        >
          <View className="flex-row items-start space-x-2">
            <Avatar
              size={28}
              rounded
              source={{ uri: comment.user.avatarUrl }}
            />
            <View className="flex-1">
              <Text className="text-sm font-semibold">
                {comment.user.fullName}
              </Text>
              <Text className="text-sm text-gray-700">{comment.content}</Text>
              <View className="flex-row items-center mt-1 space-x-2">
                <Icon name="heart" type="feather" color="gray" size={16} />
                <Text className="text-xs text-gray-500">
                  {comment.likesCount} thích
                </Text>
              </View>
            </View>
          </View>

          {/* Render replies */}
          {renderComments(comments, comment.commentId)}
        </View>
      );
    });
};
