import { createStackNavigator } from "@react-navigation/stack";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { DrawerNavigationProp } from "@react-navigation/drawer";

import CommunityScreen from "./index";
import CommunityDetail from "./community_detail";
import { RootStackParamList } from "@/constants/types/root-stack";
import CreateThread from "./create_thread";
import MyThread from "./my_thread";
import NotMember from "./not_member";
import FriendManagementScreen from "./friend_managerment";

const Stack = createStackNavigator<RootStackParamList>();
type NavigationProp = DrawerNavigationProp<RootStackParamList>;

export default function CommunityLayout() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="home_community"
        component={CommunityScreen}
        options={{
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.toggleDrawer()}
              style={{ marginLeft: 16 }}
            >
              <Ionicons name="menu" size={24} color="black" />
            </TouchableOpacity>
          ),
          headerTitle: "Cộng đồng",
          headerTitleStyle: {
            fontSize: 20,
          },
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: "white",
          },
        }}
      />

      <Stack.Screen
        name="community_detail"
        component={CommunityDetail}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="create_thread"
        component={CreateThread}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="my_threads"
        component={MyThread}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="friend_managerment"
        component={FriendManagementScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="not_member"
        component={NotMember}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
