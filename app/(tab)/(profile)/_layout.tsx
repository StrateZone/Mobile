import { createStackNavigator } from "@react-navigation/stack";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { DrawerNavigationProp } from "@react-navigation/drawer";

import DepositScreen from "./deposit";
import ProfileScreen from "./index";

import { RootStackParamList } from "@/constants/types/root-stack";
import ApointmentHistory from "./appointment_history";
import AppointmentDetail from "./appointment_history_detail";
import BalanceMovementHistory from "./balance_movement_history";
import Invitations from "./invitations";
import InvitationsDetail from "./invitations_detail";
import AppointmentOnGoing from "./appointment_ongoing";
import AppointmentOnGoingDetail from "./appointment_ongoing_detail";
import ChangePasswordScreen from "./change_password";

const Stack = createStackNavigator<RootStackParamList>();
type NavigationProp = DrawerNavigationProp<RootStackParamList>;

export default function ProfileLayout() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="profile"
        component={ProfileScreen}
        options={{
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.toggleDrawer()}
              style={{ marginLeft: 16 }}
            >
              <Ionicons name="menu" size={24} color="black" />
            </TouchableOpacity>
          ),
          headerTitle: "Thông tin cá nhân",
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
        name="deposit"
        component={DepositScreen}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="appointment_history"
        component={ApointmentHistory}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="appointment_detail"
        component={AppointmentDetail}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="balance_movement_history"
        component={BalanceMovementHistory}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="invitations"
        component={Invitations}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="invitations_detail"
        component={InvitationsDetail}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="appointment_ongoing"
        component={AppointmentOnGoing}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="appointment_ongoing_detail"
        component={AppointmentOnGoingDetail}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="change_password"
        component={ChangePasswordScreen}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}
