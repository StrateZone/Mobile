import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Avatar, Button as RNEButton } from "@rneui/themed";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "@/context/auth-context";
import { deleteRequest, postRequest } from "@/helpers/api-requests";

type CommunityCardProps = {
  theme: string;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  dateTime?: string;
  likes?: number;
  threadId?: number;
  threadData?: {
    likes: Array<{
      id: number;
      userId: number | null;
      threadId: number | null;
    }>;
  };
  createdByNavigation?: {
    userId: number;
    username: string;
    fullName: string;
    avatarUrl: string;
  };
  tags?: Array<{
    id: number;
    tag?: {
      tagId: number;
      tagName: string;
    };
  }>;
};

export default function CommunityCard({
  theme,
  title,
  description,
  dateTime,
  thumbnailUrl,
  likes = 0,
  threadId,
  threadData,
  createdByNavigation,
  tags = [],
}: CommunityCardProps) {
  const { authState } = useAuth();
  const user = authState?.user;

  const navigation = useNavigation<any>();
  const route = useRoute();
  const [isLiked, setIsLiked] = useState(false);

  const [likeCount, setLikeCount] = useState(likes);
  const [likeId, setLikeId] = useState<number | undefined>(undefined);

  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    userId: 0,
    fullName: "",
    avatarUrl: "",
  });

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
    if (threadData?.likes && currentUser.userId) {
      const userLike = threadData.likes.find(
        (like) =>
          like.userId === currentUser.userId && like.threadId === threadId,
      );

      setIsLiked(!!userLike);
      setLikeId(userLike?.id);
    }
  }, [threadData, currentUser.userId, threadId]);

  const handleCardPress = () => {
    if (threadId) {
      navigation.navigate("CommunityDetail", { threadId });
    }
  };

  const handleLike = async (e: any) => {
    e.stopPropagation?.();
    if (isLoading || !threadId || !currentUser.userId) return;
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <TouchableOpacity
      onPress={handleCardPress}
      className="bg-white rounded-xl border border-gray-300 p-4 mb-3 shadow-sm"
    >
      <View className="flex-row gap-4">
        <Image
          source={{
            uri:
              thumbnailUrl ||
              "https://cdn.pixabay.com/photo/2015/10/07/12/17/post-976115_960_720.png",
          }}
          className="w-32 h-32 rounded-lg"
          resizeMode="cover"
        />

        <View className="flex-1 justify-between">
          <View className="mb-2">
            <View className="flex-row flex-wrap gap-1 mb-1">
              {tags.map((tag) => (
                <Text
                  key={tag.id}
                  className={`text-xs px-2 py-1 rounded-full ${
                    buttonColors[tag.tag?.tagName || theme] ||
                    buttonColors.default
                  }`}
                >
                  {tag.tag?.tagName}
                </Text>
              ))}
            </View>

            <Text className="text-base font-bold text-black mb-1">{title}</Text>

            <View className="flex-row items-center space-x-3 mb-3">
              <Avatar
                source={{
                  uri:
                    createdByNavigation?.avatarUrl ||
                    "https://docs.material-tailwind.com/img/face-2.jpg",
                }}
                size={30}
                rounded
              />

              <View className="flex-col">
                <Text className="text-sm text-gray-700 font-semibold">
                  {createdByNavigation?.username || "Tác giả"}
                </Text>
                <Text className="text-xs text-gray-500">
                  {formatDateTime(dateTime)}
                </Text>
              </View>
            </View>

            <Text numberOfLines={2} className="text-sm text-gray-700">
              {description}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleLike}
            disabled={isLoading}
            className={`self-start flex-row items-center px-3 py-1 rounded border ${
              isLiked ? "border-red-400 bg-red-50" : "border-gray-300"
            }`}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="red" />
            ) : (
              <>
                <Text className="text-red-500 mr-1">❤️</Text>
                <Text className="text-sm text-red-500">{likeCount}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
