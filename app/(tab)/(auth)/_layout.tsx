import { createStackNavigator } from "@react-navigation/stack";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { DrawerNavigationProp } from "@react-navigation/drawer";

import LoginScreen from "./index";
import OtpConfirmScreen from "./otp_confirm";

const Stack = createStackNavigator();

type NavigationProp = DrawerNavigationProp<any>;

export default function AuthLayout() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="index"
        component={LoginScreen}
        options={{
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.toggleDrawer()}
              style={{ marginLeft: 16 }}
            >
              <Ionicons name="menu" size={24} color="black" />
            </TouchableOpacity>
          ),
          headerTitle: "Đăng nhập",
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
        name="Otp"
        component={OtpConfirmScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
