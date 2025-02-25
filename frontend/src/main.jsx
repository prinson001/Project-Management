import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import { router } from "./App.jsx";
import axios from "axios";

axios.interceptors.request.use((request) => {
  // request.headers["Authorization"] = `Bearer ${localStorage.getItem("token")}`;
  return request;
});
axios.interceptors.response.use((response) => {
  return response;
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
