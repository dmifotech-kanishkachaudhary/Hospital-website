/**
 * @file api.js
 * @description Centralized Axios HTTP client instance with automatic JWT Authorization header injection.
 */

import axios from "axios";
import { API } from "../config";

const apiClient = axios.create({
  baseURL: `${API}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Inject JWT Bearer Token if present in localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardized error logging
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("[API_CLIENT] Unauthorized request detected.");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
