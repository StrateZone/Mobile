import { createStackNavigator } from "@react-navigation/stack";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { DrawerNavigationProp } from "@react-navigation/drawer";

import AppointmentScreen from "./home_booking";
import ListTableScreen from "./list_table";
import BookingDetail from "./booking-detail";

import { RootStackParamList } from "@/constants/types/root-stack";
import TableDetail from "./table_detail";
import PaymentSuccessScreen from "./payment_successfull";
import FindOpponent from "./find-opponents";
import OpponentInvited from "./opponent_invited";

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
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="list_table"
        component={ListTableScreen}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="booking_detail"
        component={BookingDetail}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="table_detail"
        component={TableDetail}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="payment_successfull"
        component={PaymentSuccessScreen}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="find_opponents"
        component={FindOpponent}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="opponent_invited"
        component={OpponentInvited}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}
