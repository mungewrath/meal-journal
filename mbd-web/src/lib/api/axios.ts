import axios from "axios";

// Create axios instance with base URL from environment variable
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Add request interceptor for logging or other global handling if needed
axiosInstance.interceptors.request.use(
  (config) => {
    // You can add global request handling here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Global error handling
    console.error("API request failed:", error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
