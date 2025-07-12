import axios from "axios";

// Use environment variable or default to production URL
const baseURL = import.meta.env.VITE_API_BASE_URL || "https://projectmanagement-naje.onrender.com";

const axiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 30000, // 30 seconds timeout for production
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for CORS with credentials
});

export default axiosInstance;
