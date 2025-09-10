import React, { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user._id);
      navigate("/Dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-300 to-blue-200">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md transform transition-all duration-300 hover:scale-105">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">MindEase</h2>
        <form onSubmit={handleLogin} className="flex flex-col space-y-5">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
            required
          />
          <button
            type="submit"
            className="bg-sky-500 text-white py-3 rounded-xl font-semibold hover:bg-sky-600 transition"
          >
            Login
          </button>
        </form>
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Don’t have an account?{" "}
            <span
              className="text-sky-500 cursor-pointer font-semibold hover:underline"
              onClick={() => navigate("/register")}
            >
              Register
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
