import { ScrollView, View, Text, Image } from "react-native";
import { useAuth } from "@/context/auth-context";

export default function ProfileScreen() {
  const { authState } = useAuth();
  const user = authState?.user;

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ flexGrow: 1, padding: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="items-center mb-6">
        <Image
          source={{
            uri: "https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg",
          }}
          className="w-24 h-24 rounded-full border-4 border-white shadow-md"
        />
        <Text className="text-2xl font-semibold mt-2 text-gray-900">
          {user?.username || "Họ và tên"}
        </Text>
        <Text className="text-gray-500 text-sm">
          Số dư: <Text className="font-semibold text-black">xxx VND</Text>
        </Text>
      </View>

      <View className="bg-white p-5 rounded-xl shadow-md">
        <Text className="text-gray-600 text-lg font-medium">📧 Email</Text>
        <Text className="text-gray-800 text-base mb-4">
          {user?.email || "email@gmail.com"}
        </Text>

        <Text className="text-gray-600 text-lg font-medium">
          📞 Số điện thoại
        </Text>
        <Text className="text-gray-800 text-base mb-4">
          {user?.phone || "0123456789"}
        </Text>

        <Text className="text-gray-600 text-lg font-medium">⚧ Giới tính</Text>
        <Text className="text-gray-800 text-base">{"Nam"}</Text>
      </View>
    </ScrollView>
  );
}
