import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { Dialog, Tab, TabView, CheckBox } from "@rneui/themed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/context/auth-context";
import { getRequest, postRequest } from "@/helpers/api-requests";
import Toast from "react-native-toast-message";
import { Fold } from "react-native-animated-spinkit";

export const InviteOpponentDialogForOnGoing = ({
  visible,
  onClose,
  loadAppointmentData,
  alreadyInvitedIds,
  tableId,
  appointmentId,
  startTime,
  endTime,
}: {
  visible: boolean;
  onClose: () => void;
  loadAppointmentData: () => void;
  alreadyInvitedIds: string[];
  tableId: string;
  appointmentId: string;
  startTime: string;
  endTime: string;
}) => {
  const { authState } = useAuth();
  const user = authState?.user;

  const [index, setIndex] = useState(0);
  const [markedFriends, setMarkedFriends] = useState<any[]>([]);
  const [markedOpponents, setMarkedOpponents] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getRequest(`/users/opponents/${user?.userId}`);
        const friends = data.friends.map((friend: any) => ({
          ...friend,
          isInvited: alreadyInvitedIds.includes(friend.userId),
        }));

        const opponents = data.matchingOpponents.map((opponent: any) => ({
          ...opponent,
          isInvited: alreadyInvitedIds.includes(opponent.userId),
        }));

        setMarkedFriends(friends);
        setMarkedOpponents(opponents);
      } catch (error: any) {
        console.log("API Error:", error?.response?.data || error.message);

        Toast.show({
          type: "error",
          text1: "Thất bại",
          text2:
            error?.response?.data?.message ||
            "Không thể lấy danh sách người dùng khác",
        });
      } finally {
        setLoading(false);
      }
    };

    const loadSelectedUsers = async () => {
      const saved = await AsyncStorage.getItem("selectedOpponents");
      if (saved) setSelectedUsers(JSON.parse(saved));
    };

    if (visible) {
      fetchData();
      loadSelectedUsers();
    }
  }, [visible]);

  const toggleSelect = (user: any) => {
    const exists = selectedUsers.find((u) => u.userId === user.userId);

    let updated;

    if (exists) {
      updated = selectedUsers.filter((u) => u.userId !== user.userId);
    } else {
      if (selectedUsers.length >= 6) {
        Toast.show({
          type: "error",
          text1: "Quá giới hạn",
          text2: "Chỉ được phép mời tối đa 6 người",
        });
        return;
      }
      updated = [...selectedUsers, user];
    }

    setSelectedUsers(updated);
    AsyncStorage.setItem("selectedOpponents", JSON.stringify(updated));
  };

  const handleSendInvitations = async () => {
    setSending(true);
    try {
      const payload = {
        fromUser: user?.userId,
        toUser: selectedUsers.map((u) => u.userId),
        tableId,
        appointmentId,
        startTime,
        endTime,
        totalPrice: 0,
      };

      await postRequest("/appointmentrequests", payload);

      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Đã gửi lời mời đến đối thủ",
      });

      setSelectedUsers([]);
      await AsyncStorage.removeItem("selectedOpponents");

      onClose();
      loadAppointmentData();
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Thất bại",
        text2: "Gửi lời mời thất bại",
      });
    } finally {
      setSending(false);
    }
  };

  const renderUser = (user: any) => {
    const isChecked = selectedUsers.some((u) => u.userId === user.userId);
    return (
      <TouchableOpacity
        key={user.userId}
        onPress={() => toggleSelect(user)}
        className="flex-row items-center px-3 py-2 border-b border-gray-200"
      >
        <Image
          source={{
            uri:
              user.avatarUrl ||
              "https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg",
          }}
          className="w-10 h-10 rounded-full"
        />
        <View className="flex-1 ml-3">
          <Text className="font-semibold text-base">{user.fullName}</Text>
          <Text className="text-sm text-gray-500">@{user.username}</Text>
        </View>
        <CheckBox checked={isChecked} onPress={() => toggleSelect(user)} />
      </TouchableOpacity>
    );
  };

  return (
    <Dialog
      isVisible={visible}
      onBackdropPress={onClose}
      overlayStyle={{ borderRadius: 16, padding: 0 }}
    >
      <Dialog.Title
        title="Mời thêm đối thủ"
        titleStyle={{ fontSize: 18, fontWeight: "bold", paddingHorizontal: 16 }}
      />

      <View style={{ height: 500 }}>
        <Tab
          value={index}
          onChange={setIndex}
          indicatorStyle={{ backgroundColor: "blue" }}
          containerStyle={{ marginBottom: 0 }}
        >
          <Tab.Item title="Bạn bè" titleStyle={{ fontSize: 12 }} />
          <Tab.Item title="Đối thủ khác" titleStyle={{ fontSize: 12 }} />
          <Tab.Item
            title={`Đã chọn (${selectedUsers.length})`}
            titleStyle={{ fontSize: 12 }}
          />
        </Tab>

        <TabView
          value={index}
          onChange={setIndex}
          animationType="spring"
          containerStyle={{ flex: 1 }}
        >
          <TabView.Item
            style={{ width: "100%", display: index === 0 ? "flex" : "none" }}
          >
            {loading ? (
              <View className="flex justify-center items-center mt-32">
                <Fold size={48} color="#000000" />
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                <ScrollView
                  style={{ flex: 1 }}
                  contentContainerStyle={{ paddingBottom: 20 }}
                >
                  {markedFriends.length === 0 ? (
                    <Text className="text-center text-gray-500 p-4">
                      Chưa có bạn bè nào
                    </Text>
                  ) : (
                    markedFriends.map(renderUser)
                  )}
                </ScrollView>
              </View>
            )}
          </TabView.Item>

          <TabView.Item
            style={{ width: "100%", display: index === 1 ? "flex" : "none" }}
          >
            {loading ? (
              <View className="flex justify-center items-center mt-32">
                <Fold size={48} color="#000000" />
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                <ScrollView
                  style={{ flex: 1 }}
                  contentContainerStyle={{ paddingBottom: 20 }}
                >
                  {markedOpponents.length === 0 ? (
                    <Text className="text-center text-gray-500 p-4">
                      Không có đối thủ nào
                    </Text>
                  ) : (
                    markedOpponents.map(renderUser)
                  )}
                </ScrollView>
              </View>
            )}
          </TabView.Item>

          <TabView.Item
            style={{ width: "100%", display: index === 2 ? "flex" : "none" }}
          >
            {index === 2 ? (
              loading ? (
                <View className="flex justify-center items-center mt-32">
                  <Fold size={48} color="#000000" />
                </View>
              ) : (
                <View style={{ flex: 1 }}>
                  {selectedUsers.length === 0 ? (
                    <Text className="text-center text-gray-500 p-4">
                      Chưa chọn đối thủ nào
                    </Text>
                  ) : (
                    selectedUsers.map(renderUser)
                  )}
                </View>
              )
            ) : null}
          </TabView.Item>
        </TabView>
        {selectedUsers.length > 0 && (
          <TouchableOpacity
            disabled={sending}
            className={`mx-4 my-4 py-3 rounded-xl ${
              sending ? "bg-gray-400" : "bg-blue-600"
            }`}
            onPress={handleSendInvitations}
          >
            {sending ? (
              <View className="flex flex-row justify-center items-center">
                <Fold size={18} color="#ffffff" />
                <Text className="text-white font-semibold text-base ml-2">
                  Đang gửi...
                </Text>
              </View>
            ) : (
              <Text className="text-center text-white font-semibold text-base">
                Mời {selectedUsers.length} đối thủ
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </Dialog>
  );
};
