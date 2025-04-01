import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

import { config } from "../config";

interface AuthProps {
  authState?: {
    token: string | null;
    authenticated: boolean | null;
    user?: {
      userId: number;
      userRole: string;
      status: string;
      gender: string;
      skillLevel: string;
      ranking: string;
      wallet: {
        walletId: number;
        userId: number;
        balance: number;
        status: string;
      };
      username: string;
      fullName: string;
      email: string;
      phone: string;
    };
  };
  onLogin?: (email: string, otp: string) => Promise<any>;
  onUpdateUserBalance?: () => Promise<any>;
  onLogout?: () => Promise<any>;
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
    token: string | null;
    authenticated: boolean | null;
    user?: {
      userId: number;
      userRole: string;
      status: string;
      gender: string;
      skillLevel: string;
      ranking: string;
      wallet: {
        walletId: number;
        userId: number;
        balance: number;
        status: string;
      };
      username: string;
      fullName: string;
      email: string;
      phone: string;
    };
  }>({
    token: null,
    authenticated: null,
  });

  useEffect(() => {
    const loadToken = async () => {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const userData = await SecureStore.getItemAsync(USER_DATA_KEY);

      if (token && userData) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        setAuthState({
          token: token,
          authenticated: true,
          user: JSON.parse(userData),
        });
      }
    };

    loadToken();
  }, []);

  const login = async (email: string, otp: string) => {
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
          email: response.data.data.email,
          phone: response.data.data.phone,
        };

        setAuthState({
          token: response.data.data.accessToken,
          authenticated: true,
          user: userData,
        });

        axios.defaults.headers.common["Authorization"] =
          `Bearer ${response.data.data.accessToken}`;

        await SecureStore.setItemAsync(
          TOKEN_KEY,
          response.data.data.accessToken,
        );
        await SecureStore.setItemAsync(
          REFRESH_TOKEN_KEY,
          response.data.data.refreshToken,
        );
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
    } catch (error) {
      console.error("Error deleting tokens:", error);
    }

    axios.defaults.headers.common["Authorization"] = "";

    setAuthState({
      token: null,
      authenticated: false,
      user: undefined,
    });
  };

  const value = {
    onLogin: login,
    onLogout: logout,
    onUpdateUserBalance: updateUserBalance,
    authState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
