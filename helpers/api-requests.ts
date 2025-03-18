import axios from "axios";

import { config } from "../config";
export const getRequest = async (
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

  const { data } = await axios.get(
    `${config.BACKEND_API}/api${path}?${params.toString()}`,
  );

  return data;
};

export const postRequest = async (
  path: string,
  requestBody?: Record<string, unknown>,
  query?: Record<string, unknown>,
) => {
  console.log(query);
  const data = await axios.post(
    `${config.BACKEND_API}/api${path}`,
    requestBody,
    {
      params: query,
    },
  );

  return data;
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
  token: string,
  requestBody: Record<string, unknown>,
) => {
  const { data } = await axios.patch(
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
