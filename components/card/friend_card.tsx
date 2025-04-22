import React from "react";
import { View, Text } from "react-native";
import { Avatar } from "@rneui/themed";

type Props = {
  user: any;
  buttons?: React.ReactNode;
  createdAt?: string;
};
export default function FriendCard({ user, buttons, createdAt }: Props) {
  return (
    <View className="bg-white p-4 rounded-2xl shadow-md mb-4">
      <View className="flex-row items-center mb-3">
        <Avatar
          source={{
            uri:
              user.avatarUrl ||
              "https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg",
          }}
          rounded
          size={50}
        />
        <View>
          <Text className="ml-4 font-semibold text-base text-black">
            {user.username || user.fromUserNavigation?.username}
          </Text>
          {createdAt && (
            <Text className="ml-4">
              Đã gửi {new Date(createdAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>

      {/* Nút hành động */}
      {buttons && (
        <View className="mt-3 flex-row justify-end gap-2">{buttons}</View>
      )}
    </View>
  );
}
