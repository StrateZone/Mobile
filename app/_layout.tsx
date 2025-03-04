import { createStackNavigator } from "@react-navigation/stack";
import "../global.css";
import { ThemeProvider, createTheme } from "@rneui/themed";

import { FavoritesProvider } from "@/context/FavoritesContext";
import TabLayout from "./(tab)/_layout";
import FilterScreen from "./(filter)";

const Stack = createStackNavigator();

const theme = createTheme({
  lightColors: {
    primary: "#000000",
  },
  darkColors: {
    primary: "#000000",
  },
  mode: "light",
});

export default function RootLayout() {
  return (
    <ThemeProvider theme={theme}>
      <FavoritesProvider>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={TabLayout}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Filter"
            component={FilterScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </FavoritesProvider>
    </ThemeProvider>
  );
}
