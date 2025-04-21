// components/friend/FriendCard.tsx

import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";

import { Card, Button } from "@rneui/themed";
import { Opponents } from "@/constants/types/opponent";

type FriendCardProps = {
  user: Opponents;
  isFriend: boolean;
  onAddFriend?: () => void;
};

const FriendCard: React.FC<FriendCardProps> = ({
  user,
  isFriend,
  onAddFriend,
}) => {
  return (
    <Card containerStyle={{ borderRadius: 16, padding: 16 }}>
      <View className="flex-row items-center mb-4">
        <Image
          source={{ uri: user.avatarUrl || "https://via.placeholder.com/150" }}
          className="w-16 h-16 rounded-full mr-4"
          resizeMode="cover"
        />
        <View>
          <Text className="text-base font-semibold text-black">
            {user.username}
          </Text>
          <Text className="text-sm text-gray-500">
            {user.fullName || "No name provided"}
          </Text>
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-sm text-gray-700">Points: {user.points}</Text>
      </View>

      {isFriend ? (
        <Button
          title="Đã kết bạn"
          type="outline"
          disabled
          buttonStyle={{ borderColor: "#ccc" }}
          titleStyle={{ color: "#777" }}
        />
      ) : (
        <Button
          title="Thêm bạn"
          onPress={onAddFriend}
          buttonStyle={{ backgroundColor: "#3b82f6", borderRadius: 8 }}
        />
      )}
    </Card>
  );
};

export default FriendCard;
