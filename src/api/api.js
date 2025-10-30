import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // ✅ includes /api
});



// Add JWT token to requests if it exists
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

// Optional: Interceptor for responses to handle errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can handle specific status codes here
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized! Token may be invalid or expired.");
      // Optionally, you can redirect to login page here
    }
    return Promise.reject(error);
  }
);

export default API;
