import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import CounselorDashboard from "./Pages/counselorDashboard";
import Sessions from "./Pages/Sessions";
import Users from "./Pages/Users";
import Resources from "./Pages/Resources";
import Login from "./Pages/LoginPage";
import Register from "./Pages/RegisterPage";
import Questionnaire from "./Pages/QuestionnairePage";
import Results from "./Pages/ResultsPage";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/results" element={<Results />} />

        <Route
          path="/Dashboard"
          element={
            <PrivateRoute>
              <CounselorDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/sessions"
          element={
            <PrivateRoute>
              <Sessions />
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <Users />
            </PrivateRoute>
          }
        />
        <Route
          path="/resources"
          element={
            <PrivateRoute>
              <Resources />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
