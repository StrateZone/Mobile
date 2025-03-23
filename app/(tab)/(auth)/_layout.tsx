import { createStackNavigator } from "@react-navigation/stack";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { DrawerNavigationProp } from "@react-navigation/drawer";

import LoginScreen from "./login";
import OtpConfirmScreen from "./otp_confirm";
import RegisterScreen from "./register";

import { RootStackParamList } from "@/constants/types/root-stack";

const Stack = createStackNavigator<RootStackParamList>();
type NavigationProp = DrawerNavigationProp<RootStackParamList>;

export default function AuthLayout() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="login"
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
        name="Register"
        component={RegisterScreen}
        options={{
          headerShown: false,
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
