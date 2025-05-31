import { createStackNavigator } from "@react-navigation/stack";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { DrawerNavigationProp } from "@react-navigation/drawer";

import MonthlyBookingScreen from "./index";
import ListMonthlyTableScreen from "./list_table";
import MonthlyBookingDetailScreen from "./booking-detail";
import FindOpponentScreen from "./find-opponents";
import OpponentInvitedScreen from "./opponent_invited";
import VoucherExchangeScreen from "./voucher_exchange";
import PaymentSuccessScreen from "./payment_successfull";
import TableDetailScreen from "./table_detail";
import { RootStackParamList } from "@/constants/types/root-stack";
import OpponentInvited from "./opponent_invited";
import FindOpponent from "./find-opponents";
import MonthlyTableDetail from "./table_detail";

const Stack = createStackNavigator<RootStackParamList>();
type NavigationProp = DrawerNavigationProp<RootStackParamList>;

export default function MonthlyBookingLayout() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="home_monthly_booking"
        component={MonthlyBookingScreen}
        options={{
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.toggleDrawer()}
              style={{ marginLeft: 16 }}
            >
              <Ionicons name="menu" size={24} color="black" />
            </TouchableOpacity>
          ),
          headerTitle: "Đặt hẹn định kì",
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
        name="list_table_monthly"
        component={ListMonthlyTableScreen}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="table_detail_monthly"
        component={MonthlyTableDetail}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="booking_detail_monthly"
        component={MonthlyBookingDetailScreen}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="find_opponents_monthly"
        component={FindOpponent}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="opponent_invited_monthly"
        component={OpponentInvited}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="voucher_exchange_monthly"
        component={VoucherExchangeScreen}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="payment_successful_monthly"
        component={PaymentSuccessScreen}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />

      {/* <Stack.Screen
        name="table_detail_monthly"
        component={TableDetailScreen}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      /> */}
    </Stack.Navigator>
  );
}
