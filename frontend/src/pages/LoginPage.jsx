import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import axiosInstance from "../axiosInstance";
import logo from "../assets/rakias-logo.png"; // Adjust the path to your logo image
import { toast, Toaster } from "sonner";
const PORT = import.meta.env.VITE_PORT;

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const setToken = useAuthStore((state) => state.setToken);
  const setRole = useAuthStore((state) => state.setRole);
  const setUserId = useAuthStore((state) => state.setUserId);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post(`/auth/login`, {
        email,
        password,
      });
      console.log("REsponse", response);
      if (response.status === 200) {
        const data = response.data;
        console.log("Data", data);
        setToken(data.token);
        toast.success("Logged in Successfully");
        // Store the user role
        const userRole = data.role;
        const userId = data.userId;
        setRole(userRole);
        setUserId(userId);

        // Redirect based on role
        switch (userRole) {
          case "PM":
          case "DEPUTY":
            navigate("/tasks");
            break;
          case "PMO":
            navigate("/data-management");
            break;
          case "ADMIN":
            navigate("/admin");
            break;
          default:
            navigate("/home");
            break;
        }
      } else {
        console.error("Login failed");
        toast.error("Login Failed");
      }
    } catch (error) {
      toast.error("Login Failed");
      console.error("Error logging in:", error);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setShowForgotPassword(true);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // Validate that new password and confirm password match
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    try {
      // Call your backend API to change the password
      const response = await axiosInstance.post(`/auth/reset-password`, {
        email: resetEmail,
        currentPassword,
        newPassword,
      });

      if (response.status === 200) {
        // Reset the form and show login page again
        setShowForgotPassword(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setResetEmail("");
        setPasswordError("");
        // You could add a success message here if needed
      } else {
        setPasswordError("Failed to reset password");
      }
    } catch (error) {
      console.log("Error resetting password:", error);
      setPasswordError("Error resetting password. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side - Login Form or Forgot Password Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 py-12 bg-white">
        <div className="w-full max-w-md mx-auto">
          {!showForgotPassword ? (
            <>
              <div className="mb-6">
                <button className="w-full py-2 px-4 text-[#5AE6C8] hover:underline focus:outline-none">
                  Single Sign On
                </button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4 md:flex md:space-x-4">
                  <div className="md:w-1/2">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div className="md:w-1/2">
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Password
                      </label>
                      <a
                        href="#"
                        className="text-sm text-blue-500 hover:text-blue-700"
                        onClick={handleForgotPassword}
                      >
                        Forgot Password?
                      </a>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center mb-6">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Remember me
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sign in to your account
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Reset Password
              </h2>

              {passwordError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                  {passwordError}
                </div>
              )}

              <form onSubmit={handlePasswordChange}>
                <div className="mb-4">
                  <label
                    htmlFor="reset-email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    id="reset-email"
                    name="reset-email"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="email@example.com"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="current-password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Current Password
                  </label>
                  <input
                    id="current-password"
                    name="current-password"
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="new-password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    New Password
                  </label>
                  <input
                    id="new-password"
                    name="new-password"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirm New Password
                  </label>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="w-1/2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Change Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="w-1/2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Right side - Brand/Logo (remains the same) */}
      <div className="hidden md:flex md:w-1/2 bg-gray-50 flex-col justify-center items-center">
        <div className="text-center">
          <div className="mb-4">
            <img src={logo} alt="Logo" className="w-32 h-32 mx-auto" />
          </div>
          <h2 className="text-4xl font-bold text-[#4892DC] mb-1">Rakais</h2>
          <p className="text-gray-600">Simplify. Optimize. Succeed</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
