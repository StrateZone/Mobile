import { createStackNavigator } from "@react-navigation/stack";

import FavoriteScreen from "./index";

const Stack = createStackNavigator();

export default function FavoriteLayout() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="index"
        component={FavoriteScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
