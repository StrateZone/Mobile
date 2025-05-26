import axios from "axios";
import * as SecureStore from "expo-secure-store";

import { config } from "../config";
import { Alert } from "react-native";

const TOKEN_KEY = "userAccessToken";
const REFRESH_TOKEN_KEY = "userRefreshToken";

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const refreshToken = async () => {
  try {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await axios.post(
      `${config.BACKEND_API}/api/auth/refresh-token`,
      {
        refreshToken,
      }
    );

    if (response.data.success) {
      const { newToken, refreshToken: newRefreshToken } = response.data.data;
      await SecureStore.setItemAsync(TOKEN_KEY, newToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, newRefreshToken);
      return newToken;
    }
    throw new Error("Failed to refresh token");
  } catch (error) {
    // Nếu refresh token thất bại, xóa tất cả token và đăng xuất
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    throw error;
  }
};
// Thêm axios interceptor
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        try {
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return axios(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshToken();
        axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return axios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

const getAuthHeader = async () => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getRequest = async (
  path: string,
  query?: Record<string, unknown>
) => {
  try {
    const params = new URLSearchParams();
    const headers = await getAuthHeader();

    if (query) {
      for (const key in query) {
        const value = query[key];

        if (Array.isArray(value)) {
          value.forEach((val) => params.append(key, String(val)));
        } else {
          params.append(key, String(value));
        }
      }
    }
    // console.log( `${config.BACKEND_API}/api${path}?${params.toString()}`)
    const { data } = await axios.get(
      `${config.BACKEND_API}/api${path}?${params.toString()}`,
      { headers }
    );
    return data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error:
          error.response?.data.error ||
          error.response?.data ||
          "Đã xảy ra lỗi không xác định.",
        status: error.response?.status || 500,
      };
    } else {
      console.error("Unexpected error:", error);
      return {
        success: false,
        error: "Lỗi không xác định.",
        status: 500,
      };
    }
  }
};

export const postRequest = async (
  path: string,
  requestBody?: Record<string, unknown>,
  query?: Record<string, unknown>
) => {
  try {
    const headers = await getAuthHeader();
    const response = await axios.post(
      `${config.BACKEND_API}/api${path}`,
      requestBody,
      {
        params: query,
        headers,
      }
    );

    return response;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const errData = error.response?.data;
      return {
        success: false,
        error:
          errData?.error || errData?.message || "Đã xảy ra lỗi không xác định.",
        status: error.response?.status || 500,
      };
    } else {
      console.error("Unexpected error:", error);
      return {
        success: false,
        error: "Lỗi không xác định.",
        status: 500,
      };
    }
  }
};

export const postRequestComment = async (
  path: string,
  requestBody?: Record<string, unknown>,
  query?: Record<string, unknown>
) => {
  try {
    const headers = await getAuthHeader();
    const response = await axios.post(
      `${config.BACKEND_API}/api${path}`,
      requestBody,
      {
        params: query,
        headers,
      }
    );
    return response;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const errData = error.response?.data;
      return {
        success: false,
        error:
          errData?.error || errData?.message || "Đã xảy ra lỗi không xác định.",
        status: error.response?.status || 500,
      };
    } else {
      console.error("Unexpected error:", error);
      return {
        success: false,
        error: "Lỗi không xác định.",
        status: 500,
      };
    }
  }
};

export const postPaymemtRequest = async (
  path: string,
  requestBody?: Record<string, unknown>,
  token?: string
) => {
  const headers = await getAuthHeader();
  const { data } = await axios.post(
    `${config.BACKEND_API}/api${path}`,
    requestBody,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : headers,
    }
  );
  return data;
};

export const patchRequest = async (
  path: string,
  requestBody: Record<string, unknown>
) => {
  const headers = await getAuthHeader();
  const { data } = await axios.patch(
    `${config.BACKEND_API}/api${path}`,
    requestBody,
    { headers }
  );

  return data;
};

export const putRequest = async (
  path: string,
  requestBody: Record<string, unknown>
) => {
  try {
    const headers = await getAuthHeader();
    const data = await axios.put(
      `${config.BACKEND_API}/api${path}`,
      requestBody,
      { headers }
    );

    return data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const errData = error.response?.data;
      return {
        success: false,
        error:
          errData?.error || errData?.message || "Đã xảy ra lỗi không xác định.",
        status: error.response?.status || 500,
      };
    } else {
      console.error("Unexpected error:", error);
      return {
        success: false,
        error: "Lỗi không xác định.",
        status: 500,
      };
    }
  }
};

export const deleteRequest = async (
  path: string,
  query?: Record<string, unknown>
) => {
  const params = new URLSearchParams();
  const headers = await getAuthHeader();

  if (query) {
    for (const key in query) {
      const value = query[key];
      if (Array.isArray(value)) {
        value.forEach((val) => params.append(key, String(val)));
      } else {
        params.append(key, String(value));
      }
    }
  }

  const { data } = await axios.delete(
    `${config.BACKEND_API}/api${path}?${params.toString()}`,
    { headers }
  );
  return data;
};

export function translateValidationErrors<T>(
  errors: Record<string, string | string[]>
): Partial<T> {
  const result: any = {};

  for (const key in errors) {
    const error = errors[key];
    result[key] = Array.isArray(error) ? error[0] : error;
  }

  return result;
}

export type ApiRequestError = {
  response?: {
    data?: {
      code: string;
      message: string | string[] | Record<string, string | string[]>;
    };
  };
};

export function handleApiRequestError<T>({
  err,
  setErrors,
  translationPrefix = "",
}: {
  err: ApiRequestError;
  setErrors?: (errors: Partial<T>) => void;
  translationPrefix?: string;
}) {
  const errorCode = err.response?.data?.code;
  const message = err.response?.data?.message;

  if (errorCode === "BAD_REQUEST" && setErrors) {
    if (typeof message === "object" && !Array.isArray(message)) {
      const validationErrors = translateValidationErrors<T>(
        message as Record<string, string | string[]>
      );
      setErrors(validationErrors);
      return;
    }
  }

  if (errorCode === "CONFLICT") {
    Alert.alert("Lỗi", "Dữ liệu đã tồn tại.");
    return;
  }

  Alert.alert("Lỗi", "Đã có lỗi xảy ra, vui lòng thử lại sau.");
}
