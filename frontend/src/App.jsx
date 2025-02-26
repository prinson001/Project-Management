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
import TasksPage from "./pages/TasksPage";
import DataManagementPage from "./pages/DataManagementPage";
import DashboardPage from "./pages/DashboardPage";
import ActivitiesPage from "./pages/ActivitiesPage";
import Test from "./pages/Test";
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
    element: <LoginPage />,
  },
  {
    path: "/home",
    element: (
      <ProtectedRoute allowedRoles={["PM", "PMO", "DEPUTY", "ADMIN", "USER"]}>
        <HomePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/tasks",
    element: (
      <ProtectedRoute allowedRoles={["PM", "PMO"]}>
        <TasksPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/data-management",
    element: (
      <ProtectedRoute allowedRoles={["PMO", "DEPUTY"]}>
        <DataManagementPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute allowedRoles={["USER"]}>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/activities",
    element: (
      <ProtectedRoute allowedRoles={["PMO", "ADMIN"]}>
        <ActivitiesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/test",
    element: <Test />,
  },
]);

export default App;
