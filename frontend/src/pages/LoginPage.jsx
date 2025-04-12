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
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const setToken = useAuthStore((state) => state.setToken);
  const setRole = useAuthStore((state) => state.setRole);
  const setUserId = useAuthStore((state) => state.setUserId);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Set loading to true when login starts
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
        console.error(response.response.data.message);
        toast.error(response.response.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
      console.error("Error logging in:", error);
    } finally {
      setIsLoading(false); // Set loading to false when login completes
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
                  disabled={isLoading}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex justify-center items-center"
                >
                  {isLoading ? (
                    <>
                      <svg
                        aria-hidden="true"
                        role="status"
                        className="inline w-4 h-4 me-3 text-white animate-spin"
                        viewBox="0 0 100 101"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                          fill="#E5E7EB"
                        />
                        <path
                          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                          fill="currentColor"
                        />
                      </svg>
                      Loading...
                    </>
                  ) : (
                    "Sign in to your account"
                  )}
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
