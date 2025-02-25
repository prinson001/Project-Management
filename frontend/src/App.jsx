import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Outlet,
} from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import UsersPage from "./pages/UsersPage";
import LoginPage from "./pages/LoginPage";
import SidebarPage from "./pages/SidebarPage";
import HomePage from "./pages/HomePage";

const App = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute allowedRoles={["PM", "PMO", "DEPUTY", "ADMIN", "USER"]} />
    ),
    children: [
      {
        path: "/home",
        element: <HomePage />,
      },
      {
        path: "/sidebar",
        element: (
          <ProtectedRoute
            allowedRoles={["PM", "PMO", "DEPUTY", "ADMIN", "USER"]}
          />
        ),
        children: [
          {
            path: "/sidebar",
            element: <SidebarPage />,
          },
        ],
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
]);

export default App;
