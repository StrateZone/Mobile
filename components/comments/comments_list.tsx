import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { Avatar, Card, Icon } from "@rneui/themed";

export default function CommentList({ comments }: { comments: any[] }) {
  const [expandedReplies, setExpandedReplies] = useState<{
    [key: number]: boolean;
  }>({});

  const parentComments = comments.filter((c) => c.replyTo === null);

  const toggleReplies = (parentId: number) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [parentId]: !prev[parentId],
    }));
  };

  return (
    <>
      {parentComments.map((parent) => {
        const replies = comments.filter((c) => c.replyTo === parent.commentId);
        const isExpanded = expandedReplies[parent.commentId];
        const repliesToShow = isExpanded ? replies : replies.slice(0, 1);

        return (
          <View key={parent.commentId} style={{ marginBottom: 24 }}>
            {/* Comment chính */}
            <Card containerStyle={{ padding: 12, borderRadius: 8 }}>
              <View className="flex-row items-start space-x-2">
                <Avatar
                  size={28}
                  rounded
                  source={{ uri: parent.user.avatarUrl }}
                />
                <View style={{ flex: 1 }}>
                  <Text className="text-sm font-semibold">
                    {parent.user.fullName}
                  </Text>
                  <Text className="text-sm text-gray-800">
                    {parent.content}
                  </Text>
                  <View className="flex-row items-center mt-1 space-x-2">
                    <Icon name="heart" type="feather" color="gray" size={16} />
                    <Text className="text-xs text-gray-500">
                      {parent.likesCount} thích
                    </Text>
                  </View>
                </View>
              </View>
            </Card>

            {/* Reply */}
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
                {repliesToShow.map((reply) => {
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

                {replies.length > 1 && (
                  <TouchableOpacity
                    onPress={() => toggleReplies(parent.commentId)}
                  >
                    <Text className="text-blue-600 text-sm mt-1">
                      {isExpanded
                        ? "Ẩn bớt trả lời"
                        : `Xem thêm ${replies.length - 1} trả lời`}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        );
      })}
    </>
  );
}
