import axios from "axios";
const PORT = import.meta.env.VITE_PORT;
const axiosInstance = axios.create({
  baseURL: `http://localhost:${PORT}`, // Add your base URL here
  // timeout: 10000, // Optional: Request timeout (in ms)
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
