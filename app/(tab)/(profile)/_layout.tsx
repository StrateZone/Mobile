import { createStackNavigator } from "@react-navigation/stack";

import ProfileScreen from "./index";

const Stack = createStackNavigator();

export default function ProfileLayout() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="index"
        component={ProfileScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
