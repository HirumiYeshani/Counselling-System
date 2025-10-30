import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Student_sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `px-6 py-3 rounded transition-all duration-200 ${
      isActive ? "bg-sky-500 text-white" : "text-white hover:bg-sky-500 "
    }`;

  return (
    <aside className="w-72 bg-sky-400 text-white h-screen flex flex-col shadow-lg">
      <div className="p-8 text-3xl font-bold text-left">MindEase</div>

      <nav className="flex flex-col mt-10 flex-1 text-lg ">
        <NavLink to="/student-dashboard" className={linkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/questionnaire" className={linkClass}>
          Questionnaire
        </NavLink>
        <NavLink
          to="/mindbot"
          className="px-6 py-3 rounded hover:bg-sky-500 transition"
        >
          MindBot
        </NavLink>
        <NavLink
          to="/session"
          className="px-6 py-3 rounded hover:bg-sky-500 transition"
        >
          Sessions
        </NavLink>
        <NavLink to="/resources" className={linkClass}>
          Resources Library
        </NavLink>
        <NavLink to="/feedback" className={linkClass}>
          My Feedback
        </NavLink>
        <NavLink to="/mandala" className={linkClass}>
          Mandala Colouring
        </NavLink>
        <NavLink to="/chatroom" className={linkClass}>
          Chat Room
        </NavLink>
      </nav>

      <button
        onClick={handleLogout}
        className="mt-auto mb-8 mx-6 bg-white text-blue-600 font-semibold px-4 py-2 rounded hover:bg-gray-200 transition-colors"
      >
        Logout
      </button>
    </aside>
  );
};

export default Student_sidebar;
