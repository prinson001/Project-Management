import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  LayoutGrid,
  Moon,
  Sun,
  Heart,
  LayoutDashboard,
  Settings,
  LogOut,
} from "lucide-react";
import logo from "../assets/rakias-logo.png";
import userPicture from "../assets/userlogo.png";
import useAuth from "../hooks/userAuth";

const TopHeader = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAppsOpen, setIsAppsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { email, role } = useAuth();

  const profileRef = useRef(null);
  const appsRef = useRef(null);

  const handleClickOutside = (event) => {
    if (profileRef.current && !profileRef.current.contains(event.target)) {
      setIsProfileOpen(false);
    }
    if (appsRef.current && !appsRef.current.contains(event.target)) {
      setIsAppsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    }
  }, []);

  const handleProfileClick = () => {
    setIsProfileOpen(!isProfileOpen);
    setIsAppsOpen(false); // Close other dropdowns
  };

  const handleAppsClick = () => {
    setIsAppsOpen(!isAppsOpen);
    setIsProfileOpen(false); // Close other dropdowns
  };

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    } else {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    }
    setIsDarkMode(!isDarkMode);
  };

  return (
    <header className="antialiased">
      <nav className="bg-white border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-gray-800">
        <div className="flex flex-wrap justify-between items-center">
          <div className="flex justify-start items-center">
            {/* Logo */}
            <a href="#" className="flex mr-4">
              <img
                src={logo} // Use the imported logo variable
                className="mr-3 h-10"
                alt="Rakais Logo"
              />
              <span className="self-center text-3xl font-semibold whitespace-nowrap dark:text-white">
                Rakais
              </span>
            </a>
          </div>

          <div className="flex items-center lg:order-2">
            {/* User Role */}
            <span className="mr-3 font-bold text-gray-600 dark:text-gray-400">
              {role}
            </span>

            {/* Notifications */}
            <button
              type="button"
              className="p-2 mr-1 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
            >
              <span className="sr-only">View notifications</span>
              <Bell className="w-6 h-6" />
            </button>

            {/* Apps */}
            <div className="relative" ref={appsRef}>
              <button
                type="button"
                className="p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                onClick={handleAppsClick}
              >
                <span className="sr-only">View Apps</span>
                <LayoutGrid className="w-6 h-6" /> {/* Use LayoutGrid */}
              </button>

              {/* Apps Dropdown */}
              {isAppsOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="apps-menu-button"
                >
                  <div className="py-1" role="none">
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                      role="menuitem"
                    >
                      <LayoutDashboard className="mr-2 inline-block h-5 w-5" />
                      Dashboard
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                      role="menuitem"
                    >
                      <Settings className="mr-2 inline-block h-5 w-5" />
                      Settings
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              className="p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
              onClick={toggleDarkMode}
            >
              <span className="sr-only">Enable Dark Mode</span>
              {isDarkMode ? (
                <Sun className="w-6 h-6" />
              ) : (
                <Moon className="w-6 h-6" />
              )}
            </button>

            {/* User Menu */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                className="flex mx-3 text-sm bg-gray-800 rounded-full md:mr-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                id="user-menu-button"
                onClick={handleProfileClick}
                aria-expanded={isProfileOpen}
                aria-haspopup="true"
              >
                <span className="sr-only">Open user menu</span>
                <img
                  className="w-10 h-8 rounded-full"
                  src={userPicture}
                  alt="user photo"
                />
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                >
                  <div className="py-3 px-4">
                    <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                      {email}
                    </span>
                  </div>
                  <ul
                    className="py-1 text-gray-500 dark:text-gray-400"
                    aria-labelledby="dropdown"
                  >
                    <li>
                      <a
                        href="#"
                        className="block py-2 px-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-400 dark:hover:text-white"
                      >
                        My profile
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="block py-2 px-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-400 dark:hover:text-white"
                      >
                        Account settings
                      </a>
                    </li>
                  </ul>
                  <ul
                    className="py-1 text-gray-500 dark:text-gray-400"
                    aria-labelledby="dropdown"
                  >
                    <li>
                      <a
                        href="#"
                        className="flex items-center py-2 px-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        <Heart
                          className="mr-2 w-5 h-5 text-gray-400"
                          aria-hidden="true"
                        />
                        My likes
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="flex items-center py-2 px-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        <LayoutDashboard className="mr-2 w-5 h-5 text-gray-400" />
                        Collections
                      </a>
                    </li>
                  </ul>
                  <ul
                    className="py-1 text-gray-500 dark:text-gray-400"
                    aria-labelledby="dropdown"
                  >
                    <li>
                      <a
                        href="#"
                        className="block py-2 px-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      >
                        <LogOut className="mr-2 w-5 h-5 text-gray-400" />
                        Sign out
                      </a>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default TopHeader;
