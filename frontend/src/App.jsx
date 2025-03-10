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
import TasksPage from "./pages/TasksPage";
import DataManagementPage from "./pages/DataManagementPage";
import DashboardPage from "./pages/DashboardPage";
import ActivitiesPage from "./pages/ActivitiesPage";
import ProjectTimeLineSettings from "./pages/ProjectTimelineSettings";
import Expected from "./pages/Expected";
import UserAccordion from "./components/UserAccordion";
import BoqTaskAccordion from "./components/BoqTaskAccordion";
import DeliverablesAccordion from "./components/DeliverableAccordion";
import ProjectModal from "./components/ProjectModal";
import TasksAccordion from "./components/TasksAccordion";
import { Toaster } from "sonner";
import PMPage from "./pages/PMPage";
import AdminPage from "./pages/AdminPage";
import SchedulePlanSection from "./components/SchedulePlanSection";
import SchedulePlan from "./components/SchedulePlan";
import HomePage from "./pages/test";
// import Test from "./pages/Test";
const App = () => {
  return (
    <div>
      <Toaster position="top-center" richColors />
      <Outlet />
    </div>
  );
};

const accordionItems = [
  {
    title: "Tasks",
    content: <TasksPage />,
  },
];

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
        <PMPage />
      </ProtectedRoute>
    ),
  },
  // {
  //   path: "/data-management",
  //   element: (
  //     <ProtectedRoute allowedRoles={["PMO", "DEPUTY"]}>
  //       <DataManagementPage />
  //     </ProtectedRoute>
  //   ),
  // },
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
    element: <HomePage />,
  },
  {
    path: "/data-management",
    element: <HomePage />,
  },
  {
    path: "/expected",
    element: <Expected />,
  },
  {
    path: "/phase",
    element: <ProjectTimeLineSettings />,
  },
  {
    path: "project",
    element: <ProjectModal />,
  },
  {
    path: "admin",
    element: <AdminPage />,
  },
  {
    path: "/boq",
    element: <BoqTaskAccordion />,
  },
  {
    path: "deli",
    element: <DeliverablesAccordion />,
  },
  {
    path: "sc",
    element: <SchedulePlan />,
  },
  {
    path: "/boq",
    element: <BoqTaskAccordion />,
  },
  {
    path: "deli",
    element: <DeliverablesAccordion />,
  },
  {
    path: "sc",
    element: <SchedulePlan />,
  },
  {
    path: "plan",
    element: <SchedulePlanSection />,
  },
]);

export default App;
