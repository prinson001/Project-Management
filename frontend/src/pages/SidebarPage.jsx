import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, ListChecks, ChartPie, Database, Clock5 } from "lucide-react";
import useAuth from "../hooks/userAuth";

const SIDEBAR_ITEMS = [
  {
    name: "Tasks",
    icon: ListChecks,
    href: "/tasks",
    roles: ["PM", "PMO", "ADMIN"],
  },
  {
    name: "Dashboard",
    icon: ChartPie,
    href: "/dashboard",
    roles: ["USER", "ADMIN"],
  },
  {
    name: "Data Management",
    icon: Database,
    href: "/data-management",
    roles: ["PMO", "ADMIN"],
  },
  {
    name: "Activities",
    icon: Clock5,
    href: "/activities",
    roles: ["DEPUTY", "ADMIN"],
  },
];

const SidebarPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [language, setLanguage] = useState("en");
  const location = useLocation();
  const { roles } = useAuth();

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    // Add any additional logic for language change here
  };

  const filteredSidebarItems = SIDEBAR_ITEMS.filter((item) =>
    item.roles.includes(roles)
  );

  return (
    <div className="fixed top-19 left-0 z-40 h-screen">
      <div className="absolute top-4 left-2 p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
        <button
          onClick={handleToggleSidebar}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
      <div
        className={`h-full pt-16 overflow-y-auto transition-transform ${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-white dark:bg-gray-800`}
      >
        <div className="h-full flex flex-col justify-between">
          <nav className="mt-8 flex-grow">
            <ul className="space-y-2 font-medium">
              {filteredSidebarItems.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`flex items-center p-2 pl-4 rounded-lg group ${
                      location.pathname === item.href
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                        : "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <item.icon
                      className={`w-6 h-6 transition duration-75 ${
                        location.pathname === item.href
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                      }`}
                    />
                    {isSidebarOpen && <span className="ml-3">{item.name}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex justify-end p-4">
            <button
              onClick={() => handleLanguageChange("en")}
              className={`w-10 h-10 rounded-full border-2 ${
                language === "en" ? "border-blue-500" : "border-transparent"
              } overflow-hidden`}
            >
              {/* <img
                src={usEnglishIcon}
                alt="English"
                className="w-full h-full object-cover"
              /> */}
            </button>
            <button
              onClick={() => handleLanguageChange("ar")}
              className={`w-10 h-10 rounded-full border-2 ml-2 ${
                language === "ar" ? "border-blue-500" : "border-transparent"
              } overflow-hidden`}
            >
              {/* <img
                src={arabicIcon}
                alt="Arabic"
                className="w-full h-full object-cover"
              /> */}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarPage;
