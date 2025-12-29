import axios from "axios";
import { API_BASE_URL } from "../utils/constants";
import { getStoredToken, removeStoredAuth } from "../utils/storage";

const normalizeBaseUrl = (baseUrl?: string) => {
  if (!baseUrl) return "/api";
  const trimmed = baseUrl.replace(/\/+$/, "");
  if (trimmed.endsWith("/api")) return trimmed;
  return `${trimmed}/api`;
};

const axiosClient = axios.create({
  baseURL: normalizeBaseUrl(API_BASE_URL),
  withCredentials: true
});

axiosClient.interceptors.request.use((config) => {
  const { token } = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeStoredAuth();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;

