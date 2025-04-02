import "react-native-reanimated";
import "../gesture-handler";
import "../global.css";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { ThemeProvider, createTheme } from "@rneui/themed";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Alert } from "react-native";
import * as Linking from "expo-linking";
import Toast from "react-native-toast-message";

import AppointmentLayout from "./(tab)/(appointment)/_layout";
import ProfileLayout from "./(tab)/(profile)/_layout";
import ProductLayout from "./(tab)/(product)/_layout";
import CourseLayout from "./(tab)/(course)/_layout";
import CommunityLayout from "./(tab)/(community)/_layout";
import TournamentLayout from "./(tab)/(tournament)/_layout";
import SplashScreen from "./splash-screen";
import AuthLayout from "./(tab)/(auth)/_layout";
import DefaultButton from "@/components/button/button";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { useState } from "react";
import { TableProvider } from "@/context/select-table";

const Drawer = createDrawerNavigator();

const theme = createTheme({
  lightColors: { primary: "#000000" },
  darkColors: { primary: "#000000" },
  mode: "light",
});

const linking = {
  prefixes: [Linking.createURL("/")],
  config: {
    screens: {
      Appointment: {
        screens: {
          PaymentSuccess: "payment-success",
        },
      },
      Profile: {
        screens: {
          AppointmentHistory: "appointment-history",
        },
      },
    },
  },
};

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <SplashScreen onFinish={() => setIsLoading(false)} />;
  }

  return (
    <ThemeProvider theme={theme}>
      <TableProvider>
        <AuthProvider>
          <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
              drawerStyle: {
                backgroundColor: "#fff",
                width: 260,
              },
              drawerActiveBackgroundColor: "#000",
              drawerActiveTintColor: "#fff",
              drawerInactiveTintColor: "#333",
            }}
          >
            <Drawer.Screen
              name="Appointment"
              component={AppointmentLayout}
              options={{
                headerShown: false,
                drawerLabel: "Đặt bàn",
                drawerIcon: ({ color }) => (
                  <AntDesign size={24} name="calendar" color={color} />
                ),
              }}
            />
            <Drawer.Screen
              name="Auth"
              component={AuthLayout}
              options={{
                headerShown: false,
                drawerLabel: "Đăng nhập",
                drawerIcon: ({ color }) => (
                  <AntDesign size={24} name="calendar" color={color} />
                ),
              }}
            />
            <Drawer.Screen
              name="Products"
              component={ProductLayout}
              options={{
                headerShown: false,
                drawerLabel: "Sản phẩm",
                drawerIcon: ({ color }) => (
                  <FontAwesome name="shopping-cart" size={24} color={color} />
                ),
              }}
            />
            <Drawer.Screen
              name="Courses"
              component={CourseLayout}
              options={{
                headerShown: false,
                drawerLabel: "Khóa học",
                drawerIcon: ({ color }) => (
                  <MaterialIcons name="menu-book" size={24} color={color} />
                ),
              }}
            />
            <Drawer.Screen
              name="Tournaments"
              component={TournamentLayout}
              options={{
                headerShown: false,
                drawerLabel: "Thi đấu",
                drawerIcon: ({ color }) => (
                  <Ionicons name="trophy" size={24} color={color} />
                ),
              }}
            />
            <Drawer.Screen
              name="Community"
              component={CommunityLayout}
              options={{
                headerShown: false,
                drawerLabel: "Cộng đồng",
                drawerIcon: ({ color }) => (
                  <FontAwesome name="users" size={24} color={color} />
                ),
              }}
            />
            <Drawer.Screen
              name="Profile"
              component={ProfileLayout}
              options={{
                headerShown: false,
                drawerLabel: "Thông tin cá nhân",
                drawerIcon: ({ color }) => (
                  <Ionicons name="person-circle" size={24} color={color} />
                ),
              }}
            />
          </Drawer.Navigator>
          <Toast />
        </AuthProvider>
      </TableProvider>
    </ThemeProvider>
  );
}

function CustomDrawerContent({ navigation }: any) {
  const { authState, onLogout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Xác nhận đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất không?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đăng xuất",
          onPress: onLogout,
          style: "destructive",
        },
      ],
    );
  };

  return (
    <View style={{ flex: 1, paddingTop: 40 }}>
      <View style={{ alignItems: "center", paddingVertical: 20 }}>
        {authState?.authenticated ? (
          <View style={{ alignItems: "center", paddingVertical: 20 }}>
            <Ionicons name="person-circle" size={24} />
            <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 10 }}>
              {authState.user?.username}
            </Text>

            <Text style={{ fontSize: 14, color: "#666" }}>
              {authState.user?.email}
            </Text>
          </View>
        ) : (
          <DefaultButton
            title="Đăng nhập"
            backgroundColor="black"
            onPress={() => navigation.navigate("Auth")}
          />
        )}
      </View>

      <View
        style={{
          height: 1,
          backgroundColor: "#ccc",
          marginHorizontal: 20,
          marginBottom: 10,
        }}
      />

      <View style={{ flex: 1 }}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Appointment")}
          style={styles.menuItem}
        >
          <AntDesign name="calendar" size={24} color="#333" />
          <Text style={styles.menuText}>Đặt bàn</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("Products")}
          style={styles.menuItem}
        >
          <FontAwesome name="shopping-cart" size={24} color="#333" />
          <Text style={styles.menuText}>Sản phẩm</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("Courses")}
          style={styles.menuItem}
        >
          <MaterialIcons name="menu-book" size={24} color="#333" />
          <Text style={styles.menuText}>Khóa học</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("Tournaments")}
          style={styles.menuItem}
        >
          <Ionicons name="trophy" size={24} color="#333" />
          <Text style={styles.menuText}>Thi đấu</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("Community")}
          style={styles.menuItem}
        >
          <FontAwesome name="users" size={24} color="#333" />
          <Text style={styles.menuText}>Cộng đồng</Text>
        </TouchableOpacity>

        {authState?.authenticated && (
          <TouchableOpacity
            onPress={() => navigation.navigate("Profile")}
            style={styles.menuItem}
          >
            <Ionicons name="person-circle" size={24} color="#333" />
            <Text style={styles.menuText}>Thông tin cá nhân</Text>
          </TouchableOpacity>
        )}
      </View>

      <View
        style={{
          height: 1,
          backgroundColor: "#ccc",
          marginHorizontal: 20,
          marginBottom: 10,
        }}
      />

      {authState?.authenticated ? (
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#F05193" />
          <Text style={{ fontSize: 16, color: "#F05193", marginLeft: 10 }}>
            Đăng xuất
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 12,
    color: "#333",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
});
