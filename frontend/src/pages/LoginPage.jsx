import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import axios from "axios";
import logo from "../assets/rakias-logo.png"; // Adjust the path to your logo image

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const setToken = useAuthStore((state) => state.setToken);
  const setRole = useAuthStore((state) => state.setRole);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:4001/auth/login", {
        email,
        password,
      });
      console.log("REsponse", response);
      if (response.status === 200) {
        const data = response.data;
        console.log("Data", data);
        setToken(data.token);
        
        // Store the user role
        const userRole = data.role;
        setRole(userRole);
        
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
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side - Login Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 py-12 bg-white">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-6">
            <button className="w-full py-2 px-4 text-[#5AE6C8]  hover:underline focus:outline-none">
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
        </div>
      </div>

      {/* Right side - Brand/Logo */}
      <div className="hidden md:flex md:w-1/2 bg-gray-50 flex-col justify-center items-center">
        <div className="text-center">
          <div className="mb-4">
            <img
              src={logo} // Use the imported logo variable
              alt="Logo"
              className="w-32 h-32 mx-auto"
            />
          </div>
          <h2 className="text-4xl font-bold text-[#4892DC] mb-1">Rakais</h2>
          <p className="text-gray-600">Simplify. Optimize. Succeed</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
