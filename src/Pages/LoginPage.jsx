import React, { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

// Import your image - replace with actual image path
import loginImage from "../assets/Images/logo.png"; // Update this path

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const colors = {
    primary: "#C4B5FD", // light purple
    secondary: "#38BDF8", // sky blue
    primaryDark: "#8B5CF6", // darker purple
    secondaryDark: "#0EA5E9", // darker blue
    lightBg: "#F8FAFC"
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Send trimmed and lowercase email + trimmed password
      const res = await API.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      const user = res.data.user;
      const token = res.data.token;

      // ✅ Save JWT token and user info to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userId", user._id || user.id);

      console.log("✅ Login successful - User ID:", user._id || user.id);

      // Role-based navigation
      if (user.role === "Counselor") {
        navigate("/dashboard");
      } else if (user.role === "Student") {
        navigate("/student-dashboard");
      } else {
        alert("Unknown role. Cannot navigate.");
      }
    } catch (err) {
      // Show backend error message or default
      alert(err.response?.data?.message || "Login failed");
      console.error("Login error:", err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex px-64">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        

        {/* Main Login Card */}
        <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-12 w-full max-w-lg border border-white/40">
          
          {/* Header with Logo */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center mb-6">
              {/* Logo Image */}
              <div className="mr-4">
                <img 
                  src={loginImage} 
                  alt="MindEase Logo" 
                  className="w-16 h-16 object-contain"
                />
              </div>
              <div className="text-left">
                <h1 className="text-4xl font-bold" 
                    style={{ 
                      background: `linear-gradient(135deg, ${colors.secondaryDark}, ${colors.secondaryDark})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                  MindEase
                </h1>
                <p className="text-gray-600 text-sm mt-1">Counseling & Support System</p>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent bg-white/70 transition-all duration-200 placeholder-gray-400 hover:border-blue-200"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent bg-white/70 transition-all duration-200 placeholder-gray-400 hover:border-blue-200"
                  required
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:hover:transform-none disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                background: `linear-gradient(135deg, ${colors.secondary}, ${colors.secondary})`
              }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Sign In
                </div>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-8">
            <div className="flex-1 border-t border-gray-200"></div>
            <div className="px-4 text-gray-400 text-sm">New to MindEase?</div>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <button
              onClick={() => navigate("/register")}
              className="w-full py-3 rounded-xl font-medium transition-all duration-200 border-2 hover:shadow-md hover:scale-105"
              style={{ 
                borderColor: colors.secondary,
                color: colors.secondary,
                backgroundColor: colors.secondary + '10'
              }}
            >
              Create New Account
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Elegant Background with Logo */}
      <div className="flex-1 hidden lg:block relative overflow-hidden ">
        {/* Background Gradient */}
        <div 
          className="h-full w-full relative flex items-center justify-center"
        
        >
        
          
          {/* Main Logo Display */}
          <div className="text-center max-w-lg z-10">
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl blur-lg opacity-30 animate-pulse"></div>
                <img 
                  src={loginImage} 
                  alt="MindEase" 
                  className="relative w-48 h-48 object-contain drop-shadow-2xl animate-float"
                />
              </div>
            </div>
            
            <h2 className="text-5xl font-bold mb-6 text-gray-800">
              Your Journey to <span style={{ color: colors.secondary }}>Wellness</span>
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Access personalized mental health resources and professional support tailored just for you. Start your path to better mental wellbeing today.
            </p>
            
       
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;