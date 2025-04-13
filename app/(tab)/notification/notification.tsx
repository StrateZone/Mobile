import React, { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { ListItem } from "@rneui/themed";
import { Fold } from "react-native-animated-spinkit";

import { useAuth } from "@/context/auth-context";
import { getRequest } from "@/helpers/api-requests";
import { Notification } from "@/constants/types/notification";

const NotificationsScreen = () => {
  const { authState } = useAuth();
  const user = authState?.user;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchNotifications();
  }, []);
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await getRequest(`/notifications/users/${user!.userId}`);
      if (response?.pagedList) {
        setNotifications(response.pagedList);
      }
    } catch (error) {
      console.error("Error fetching tables", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <ListItem
      bottomDivider
      containerStyle={{
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 12,
      }}
    >
      <ListItem.Content>
        <ListItem.Title className="text-base font-semibold text-gray-800">
          {item.title}
        </ListItem.Title>
        <ListItem.Subtitle className="text-sm text-gray-600 mt-1">
          {item.content}
        </ListItem.Subtitle>
        <Text className="text-md text-gray-400 mt-2">
          {new Date(item.createdAt).toLocaleString("vi-VN")}
        </Text>
      </ListItem.Content>
    </ListItem>
  );
  return (
    <>
      {isLoading ? (
        <View className="flex justify-center items-center mt-32">
          <Fold size={48} color="#000000" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 16 }}
          ListEmptyComponent={
            <View className="items-center justify-center mt-20">
              <Text className="text-gray-500 text-base">
                Không có thông báo nào
              </Text>
            </View>
          }
        />
      )}
    </>
  );
};

export default NotificationsScreen;
