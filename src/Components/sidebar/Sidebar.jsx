import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Sidebar = ({ setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem("token");

    // Clear user state if passed from parent
    if (setUser) setUser(null);
0
    // Redirect to login page
    navigate("/login");
  };

  return (
    <aside className="w-72 bg-sky-400 text-white flex flex-col">
      <div className="p-8 text-3xl font-bold">MindEase</div>

      <nav className="flex flex-col mt-10 space-y-2 text-lg">
        <Link
          to="/Dashboard"
          className="px-6 py-3 rounded hover:bg-sky-500 transition"
        >
          Dashboard
        </Link>
        <Link
          to="/Sessions"
          className="px-6 py-3 rounded hover:bg-sky-500 transition"
        >
          Sessions
        </Link>
        <Link
          to="/Users"
          className="px-6 py-3 rounded hover:bg-sky-500 transition"
        >
          Users
        </Link>
        <Link
          to="/Resources"
          className="px-6 py-3 rounded hover:bg-sky-500 transition"
        >
          Resources
        </Link>
           <Link
          to="/CounselorChatRoom"
          className="px-6 py-3 rounded hover:bg-sky-500 transition"
        >
          ChatRoom
        </Link>
        
      </nav>

      <button
        onClick={handleLogout}
        className="mt-auto mb-8 mx-6 bg-white text-sky-600 font-semibold px-4 py-2 rounded hover:bg-gray-200 transition"
      >
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
