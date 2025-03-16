import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import AppointmentLayout from "./(appointment)/_layout";
import ProfileLayout from "./(profile)/_layout";

const Tab = createBottomTabNavigator();

export default function TabLayout() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="(explore)"
        component={AppointmentLayout}
        options={{
          headerShown: false,
          tabBarLabel: "Explore",

          tabBarIcon: ({ color }) => (
            <AntDesign size={24} name="search1" color={color} />
          ),
          tabBarActiveTintColor: "#000000",
          tabBarInactiveTintColor: "#B0B0B0",
        }}
      />
      <Tab.Screen
        name="(profile)"
        component={ProfileLayout}
        options={{
          headerShown: false,
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
          tabBarActiveTintColor: "#000000",
          tabBarInactiveTintColor: "#B0B0B0",
        }}
      />
    </Tab.Navigator>
  );
}
