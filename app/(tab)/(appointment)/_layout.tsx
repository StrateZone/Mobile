import { createStackNavigator } from "@react-navigation/stack";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { DrawerNavigationProp } from "@react-navigation/drawer";

import AppointmentScreen from "./home_booking";
import ListTableScreen from "./list_table";
import BookingDetail from "./booking-detail";

import { RootStackParamList } from "@/constants/types/root-stack";

const Stack = createStackNavigator<RootStackParamList>();
type NavigationProp = DrawerNavigationProp<RootStackParamList>;

export default function AppointmentLayout() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="home_booking"
        component={AppointmentScreen}
        options={{
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.toggleDrawer()}
              style={{ marginLeft: 16 }}
            >
              <Ionicons name="menu" size={24} color="black" />
            </TouchableOpacity>
          ),
          headerTitle: "Đặt bàn",
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
        name="list_table"
        component={ListTableScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="booking_detail"
        component={BookingDetail}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
