import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import CounselorDashboard from "./Pages/counselor/counselorDashboard";
import StudentDashboard from "./Pages/student/StudentDashboard";
import Sessions from "./Pages/counselor/Sessions";
import Users from "./Pages/counselor/Users";
import Resources from "./Pages/counselor/Resources";
import Login from "./Pages/LoginPage";
import Register from "./Pages/RegisterPage";
import Questionnaire from "./Pages/student/QuestionnairePage";
import MandalaColouring from "./Pages/student/MandalaColouring";
import LandingPage from "./Pages/LandingPage";
import ChatRoom from "./Pages/student/ChatRoom";
import CounselorChatRoom from "./Pages/counselor/CounselorChatRoom";
import MindBot from "./Pages/student/MindBot";
import Session from "./Pages/student/Session";

// PrivateRoute component with optional role checking
const PrivateRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token) return <Navigate to="/login" />;

  if (role && user?.role !== role) {
    // Redirect if user role doesn't match
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/mandala" element={<MandalaColouring />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/chatroom" element={<ChatRoom />} />
        <Route path="/mindbot" element={<MindBot />} />
        <Route path="/session" element={<Session/>} />

        {/* Student Routes */}
        <Route
          path="/student-dashboard"
          element={
            <PrivateRoute role="Student">
              <StudentDashboard />
            </PrivateRoute>
          }
        />

        {/* Counselor Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute role="Counselor">
              <CounselorDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/sessions"
          element={
            <PrivateRoute role="Counselor">
              <Sessions />
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute role="Counselor">
              <Users />
            </PrivateRoute>
          }
        />
        <Route
          path="/resources"
          element={
            <PrivateRoute role="Counselor">
              <Resources />
            </PrivateRoute>
          }
        />
        <Route
          path="/counselorchatroom"
          element={
            <PrivateRoute role="Counselor">
              <CounselorChatRoom />
            </PrivateRoute>
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
