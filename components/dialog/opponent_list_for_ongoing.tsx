import React, { useState } from "react";
import { Dialog, Divider } from "@rneui/themed";
import { View, Text, Image } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { InviteOpponentDialogForOnGoing } from "./opponents_invite_for_ongoing";

type PlayerStatus =
  | "pending"
  | "accepted"
  | "accepted_by_others"
  | "rejected"
  | "cancelled"
  | "expired"
  | "table_cancelled";

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
    case "cancelled":
      return {
        bg: "bg-red-100",
        text: "text-red-700",
        label: "Đã hủy bàn",
      };
    case "expired":
      return {
        bg: "bg-red-100",
        text: "text-red-700",
        label: "Lời mời hết hạn",
      };
    case "rejected":
      return {
        bg: "bg-gray-200",
        text: "text-red-700",
        label: "Đã từ chối lời mời",
      };
    case "table_cancelled":
      return {
        bg: "bg-red-200",
        text: "text-red-800",
        label: "Bàn đã bị hủy",
      };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-500",
        label: "Không xác định",
      };
  }
};

export default function OpponentsListForOnGoingDialog({
  visible,
  onClose,
  players,
  tableStatus,
  loadAppointmentData,
}: {
  visible: boolean;
  onClose: () => void;
  loadAppointmentData: () => void;
  players: any[];
  tableStatus: string;
}) {
  const [inviteDialogVisible, setInviteDialogVisible] = useState(false);

  const allInvalid = players.every((p) =>
    ["rejected", "accepted_by_others"].includes(p.status),
  );
  const noPending = !players.some((p) => p.status === "pending");
  const showInviteButton =
    tableStatus === "confirmed" &&
    allInvalid &&
    noPending &&
    players.length > 0;
  const onInviteMore = () => {
    setInviteDialogVisible(true);
  };

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
      {showInviteButton && (
        <View className="mt-4 px-3 pb-2">
          <Text
            onPress={onInviteMore}
            className="text-center bg-blue-500 text-white py-2 rounded-xl text-base font-medium"
          >
            Mời thêm đối thủ
          </Text>
        </View>
      )}
      {players.map((p, index) => (
        <InviteOpponentDialogForOnGoing
          key={index}
          visible={inviteDialogVisible}
          loadAppointmentData={loadAppointmentData}
          onClose={() => setInviteDialogVisible(false)}
          alreadyInvitedIds={[]}
          appointmentId={p.appointmentId}
          tableId={p.tableId}
          startTime={p.startTime}
          endTime={p.endTime}
        />
      ))}
    </Dialog>
  );
}
