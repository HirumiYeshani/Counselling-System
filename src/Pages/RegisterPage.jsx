import React, { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

// Import your image - replace with actual image path
import registerImage from "../assets/Images/logo.png"; // Update this path

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Student");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const colors = {
    primary: "#C4B5FD", // light purple
    secondary: "#38BDF8", // sky blue
    primaryDark: "#8B5CF6", // darker purple
    secondaryDark: "#0EA5E9", // darker blue
    lightBg: "#F8FAFC"
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await API.post("/auth/register", { 
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        role,
        phone: phone.trim()
      });
      alert("Registered successfully!");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.error || "Registration failed");
      console.error("Registration error:", err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex px-64 ">
      {/* Left Side - Elegant Background with Logo */}
      <div className="flex-1 hidden lg:block relative overflow-hidden">
        {/* Background Gradient */}
        <div className="h-full w-full relative flex items-center justify-center">
     
          
          {/* Main Logo Display */}
          <div className="text-center max-w-lg z-10">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl blur-lg opacity-30 animate-pulse"></div>
                <img 
                  src={registerImage} 
                  alt="MindEase" 
                  className="relative w-48 h-48 object-contain drop-shadow-2xl animate-float"
                />
              </div>
            </div>
            
            <h2 className="text-5xl font-bold mb-4 text-gray-800">
              Begin Your <span style={{ color: colors.secondary }}>Wellness</span> Journey
            </h2>
            
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              Join our supportive community and take the first step towards better mental health. 
              Professional counselors and resources are here to guide you.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-2">
      

        {/* Main Register Card - Reduced padding and spacing */}
        <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-lg border border-white/40">
          
          {/* Header with Logo - Reduced margin */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              {/* Logo Image */}
              <div className="mr-3">
                <img 
                  src={registerImage} 
                  alt="MindEase Logo" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-bold" 
                    style={{ 
                      background: `linear-gradient(135deg, ${colors.secondaryDark}, ${colors.secondaryDark})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                  MindEase
                </h1>
              </div>
            </div>
          </div>

          {/* Register Form - Reduced spacing */}
          <form onSubmit={handleRegister} className="space-y-2">
            {/* Name Field */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent bg-white/70 transition-all duration-200 placeholder-gray-400 hover:border-blue-200"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent bg-white/70 transition-all duration-200 placeholder-gray-400 hover:border-blue-200"
                  required
                />
              </div>
            </div>

            {/* Phone Field */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent bg-white/70 transition-all duration-200 placeholder-gray-400 hover:border-blue-200"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent bg-white/70 transition-all duration-200 placeholder-gray-400 hover:border-blue-200"
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                I am a
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-9 pr-8 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent bg-white/70 transition-all duration-200 appearance-none cursor-pointer hover:border-blue-200"
                >
                  <option value="Student">Student</option>
                  <option value="Counselor">Counselor</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Register Button - Reduced padding */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:hover:transform-none disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              style={{ 
                background: `linear-gradient(135deg, ${colors.secondary}, ${colors.secondary})`
              }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Divider - Reduced margin */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-200"></div>
            <div className="px-3 text-gray-400 text-xs">Already have an account?</div>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Login Link - Reduced padding */}
          <div className="text-center">
            <button
              onClick={() => navigate("/login")}
              className="w-full py-2.5 rounded-xl font-medium transition-all duration-200 border-2 hover:shadow-md hover:scale-105 text-sm"
              style={{ 
                borderColor: colors.secondary,
                color: colors.secondaryDark,
                backgroundColor: colors.secondary + '10'
              }}
            >
              Sign In to Existing Account
            </button>
          </div>

          {/* Additional Info - Reduced margin */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;