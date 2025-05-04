import axios from "axios";

import { config } from "../config";
import { Alert } from "react-native";
export const getRequest = async (
  path: string,
  query?: Record<string, unknown>,
) => {
  try {
    const params = new URLSearchParams();

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

    const { data } = await axios.get(
      `${config.BACKEND_API}/api${path}?${params.toString()}`,
    );
    return data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.log(error.response?.data);
      return {
        success: false,
        error: error.response?.data.error || "Đã xảy ra lỗi không xác định.",
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
  query?: Record<string, unknown>,
) => {
  try {
    const response = await axios.post(
      `${config.BACKEND_API}/api${path}`,
      requestBody,
      {
        params: query,
      },
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
  query?: Record<string, unknown>,
) => {
  try {
    const response = await axios.post(
      `${config.BACKEND_API}/api${path}`,
      requestBody,
      {
        params: query,
      },
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
  token?: string,
) => {
  const { data } = await axios.post(
    `${config.BACKEND_API}/api${path}`,
    requestBody,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return data;
};

export const patchRequest = async (
  path: string,
  requestBody: Record<string, unknown>,
) => {
  const { data } = await axios.patch(
    `${config.BACKEND_API}/api${path}`,
    requestBody,
  );

  return data;
};

export const putRequest = async (
  path: string,
  requestBody: Record<string, unknown>,
) => {
  try {
    const data = await axios.put(
      `${config.BACKEND_API}/api${path}`,
      requestBody,
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
  query?: Record<string, unknown>,
) => {
  const params = new URLSearchParams();

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
  );
  return data;
};

export function translateValidationErrors<T>(
  errors: Record<string, string | string[]>,
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
        message as Record<string, string | string[]>,
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
