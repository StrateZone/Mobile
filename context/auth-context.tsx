import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

import { config } from "../config";
import Toast from "react-native-toast-message";

interface AuthProps {
  authState?: {
    accessToken: string | null;
    refreshToken: string | null;
    authenticated: boolean | null;
    user?: {
      userId: number;
      userRole: string;
      status: string;
      gender: string;
      skillLevel: string;
      ranking: string;
      imageUrl: string;
      wallet: {
        walletId: number;
        userId: number;
        balance: number;
        status: string;
      };
      username: string;
      fullName: string;
      avatarUrl: string;
      email: string;
      phone: string;
    };
  };
  onLogin?: (email: string, password: string) => Promise<any>;
  onLoginByOtp?: (email: string, otp: string) => Promise<any>;
  onUpdateUserBalance?: () => Promise<any>;
  onLogout?: () => Promise<any>;
  setAuthState?: React.Dispatch<
    React.SetStateAction<{
      accessToken: string | null;
      refreshToken: string | null;
      authenticated: boolean | null;
      user?: {
        userId: number;
        userRole: string;
        status: string;
        gender: string;
        skillLevel: string;
        ranking: string;
        imageUrl: string;
        wallet: {
          walletId: number;
          userId: number;
          balance: number;
          status: string;
        };
        username: string;
        fullName: string;
        avatarUrl: string;
        email: string;
        phone: string;
      };
    }>
  >;
}

const TOKEN_KEY = "userAccessToken";
const REFRESH_TOKEN_KEY = "userRefreshToken";
const USER_DATA_KEY = "userData";
export const API_URL = `${config.BACKEND_API}/api/auth`;
const AuthContext = createContext<AuthProps>({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: any) => {
  const [authState, setAuthState] = useState<{
    accessToken: string | null;
    refreshToken: string | null;
    authenticated: boolean | null;
    user?: {
      userId: number;
      userRole: string;
      status: string;
      gender: string;
      skillLevel: string;
      ranking: string;
      imageUrl: string;
      wallet: {
        walletId: number;
        userId: number;
        balance: number;
        status: string;
      };
      username: string;
      fullName: string;
      avatarUrl: string;
      email: string;
      phone: string;
    };
  }>({
    accessToken: null,
    refreshToken: null,
    authenticated: null,
  });

  useEffect(() => {
    const loadToken = async () => {
      const accessToken = await SecureStore.getItemAsync(TOKEN_KEY);
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      const userData = await SecureStore.getItemAsync(USER_DATA_KEY);

      if (accessToken && userData) {
        axios.defaults.headers.common["Authorization"] =
          `Bearer ${accessToken}`;

        setAuthState({
          accessToken,
          refreshToken,
          authenticated: true,
          user: JSON.parse(userData),
        });
      }
    };

    loadToken();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });
      if (response.data.success) {
        const userData = {
          userId: response.data.data.userId,
          userRole: response.data.data.userRole,
          status: response.data.data.status,
          gender: response.data.data.gender,
          skillLevel: response.data.data.skillLevel,
          ranking: response.data.data.ranking,
          wallet: response.data.data.wallet,
          username: response.data.data.username,
          fullName: response.data.data.fullName,
          avatarUrl: response.data.data.avatarUrl,
          email: response.data.data.email,
          phone: response.data.data.phone,
          imageUrl: response.data.data.imageUrl,
        };

        const accessToken = response.data.data.accessToken;
        const refreshToken = response.data.data.refreshToken;

        setAuthState({
          accessToken,
          refreshToken,
          authenticated: true,
          user: userData,
        });

        axios.defaults.headers.common["Authorization"] =
          `Bearer ${accessToken}`;

        await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
        await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(userData));

        return { success: true, message: "Đăng nhập thành công!" };
      }

      return { error: true, msg: "Đăng nhập thất bại!" };
    } catch (e) {
      return {
        error: true,
        msg: (e as any).response?.data?.message || "Lỗi kết nối!",
      };
    }
  };

  const loginByOtp = async (email: string, otp: string) => {
    try {
      const response = await axios.post(`${API_URL}/verify-otp`, {
        email,
        otp,
      });
      if (response.data.success) {
        const userData = {
          userId: response.data.data.userId,
          userRole: response.data.data.userRole,
          status: response.data.data.status,
          gender: response.data.data.gender,
          skillLevel: response.data.data.skillLevel,
          ranking: response.data.data.ranking,
          wallet: response.data.data.wallet,
          username: response.data.data.username,
          fullName: response.data.data.fullName,
          avatarUrl: response.data.data.avatarUrl,
          email: response.data.data.email,
          phone: response.data.data.phone,
          imageUrl: response.data.data.imageUrl,
        };

        const accessToken = response.data.data.accessToken;
        const refreshToken = response.data.data.refreshToken;

        setAuthState({
          accessToken,
          refreshToken,
          authenticated: true,
          user: userData,
        });

        axios.defaults.headers.common["Authorization"] =
          `Bearer ${accessToken}`;

        await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
        await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(userData));

        return { success: true, message: "Đăng nhập thành công!" };
      }

      return { error: true, msg: "Đăng nhập thất bại!" };
    } catch (e) {
      return {
        error: true,
        msg: (e as any).response?.data?.message || "Lỗi kết nối!",
      };
    }
  };

  const updateUserBalance = async () => {
    if (!authState.user) return;
    try {
      const response = await axios.get(
        `${config.BACKEND_API}/api/wallets/users/${authState.user.userId}`,
      );
      if (response.data) {
        setAuthState((prev) => ({
          ...prev,
          user: prev.user
            ? {
                ...prev.user,
                wallet: { ...prev.user.wallet, balance: response.data.balance },
              }
            : prev.user,
        }));
      }
    } catch (error) {
      console.error("Lỗi cập nhật số dư:", error);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_DATA_KEY);
      Toast.show({
        type: "success",
        text1: "Thành công",
        text2: "Đăng xuất thành công",
      });
    } catch (error) {
      console.error("Error deleting tokens:", error);
    }

    axios.defaults.headers.common["Authorization"] = "";

    setAuthState({
      accessToken: null,
      refreshToken: null,
      authenticated: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        onLogin: login,
        onLoginByOtp: loginByOtp,
        onUpdateUserBalance: updateUserBalance,
        onLogout: logout,
        setAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
