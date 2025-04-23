import React from "react";
import { Dialog, Divider } from "@rneui/themed";
import { View, Text, Image } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

type PlayerStatus = "pending" | "accepted" | "accepted_by_others" | "rejected";

const getStatusStyle = (status: PlayerStatus) => {
  switch (status) {
    case "pending":
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        label: "Đang chờ phản hồi",
      };
    case "accepted":
      return {
        bg: "bg-green-100",
        text: "text-green-700",
        label: "Đã chấp nhận",
      };
    case "accepted_by_others":
      return {
        bg: "bg-pink-100",
        text: "text-pink-700",
        label: "Lời mời đã có người chấp nhận",
      };
    default:
      return { bg: "bg-red-100", text: "text-red-700", label: "Đã từ chối" };
  }
};

export default function OpponentsListDialog({
  visible,
  onClose,
  players,
}: {
  visible: boolean;
  onClose: () => void;
  players: any[];
}) {
  return (
    <Dialog
      isVisible={visible}
      onBackdropPress={onClose}
      overlayStyle={{ borderRadius: 16 }}
    >
      <Dialog.Title
        title="Danh sách người chơi"
        titleStyle={{ fontSize: 20, fontWeight: "bold" }}
      />

      <ScrollView style={{ maxHeight: 500 }}>
        {players.length === 0 ? (
          <Text className="text-center text-gray-500 py-4 text-base">
            Chưa có người được mời
          </Text>
        ) : (
          players.map((p) => {
            const user = p.toUser;
            const status = getStatusStyle(p.status);

            return (
              <View
                key={user.userId}
                className="flex-row items-center justify-between px-3 py-4"
              >
                {/* Avatar + Info */}
                <View className="flex-row items-center space-x-3 flex-1">
                  {user.avatarUrl ? (
                    <Image
                      source={{ uri: user.avatarUrl }}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <View className="w-12 h-12 rounded-full bg-gray-300 justify-center items-center">
                      <Text className="text-white text-xl font-semibold">
                        {user.username[0].toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View className="flex-1">
                    <Text className="text-base font-semibold" numberOfLines={1}>
                      {user.fullName}
                    </Text>
                    <Text className="text-sm text-gray-500" numberOfLines={1}>
                      @{user.username}
                    </Text>
                  </View>
                </View>

                <View className="items-end ml-2">
                  <Text
                    className={`text-xs px-2 py-1 rounded-xl ${status.bg} ${status.text}`}
                  >
                    {status.label}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </Dialog>
  );
}
