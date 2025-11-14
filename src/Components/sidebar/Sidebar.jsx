import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  FiHome, 
  FiClock, 
  FiUsers, 
  FiFileText, 
  FiMessageSquare,
  FiLogOut,
  FiUser
} from "react-icons/fi";
import { 
  HiOutlineHome, 
  HiOutlineClock, 
  HiOutlineUsers, 
  HiOutlineDocumentText,
  HiOutlineChatAlt2,
  HiOutlineLogout,
  HiOutlineUser
} from "react-icons/hi";
import logo from "../../assets/Images/logo.png";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="w-72 bg-sky-300 text-black flex flex-col shadow-xl">
      {/* Logo + Title Section */}
      <div className="p-6 flex flex-col items-center">
        <img
          src={logo}
          alt="MindEase Logo"
          className="w-20 h-20 mb-3"
        />
        <h1 className="text-2xl font-bold text-black">MindEase</h1>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2 text-lg">
        <NavLink
          to="/Dashboard"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
              isActive 
                ? "bg-white text-sky-600 shadow-lg" 
                : "hover:bg-sky-200 text-black"
            }`
          }
        >
          <HiOutlineHome className="w-5 h-5 mr-3 group-[.active]:text-sky-600" />
          Dashboard
        </NavLink>

        <NavLink
          to="/Sessions"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
              isActive 
                ? "bg-white text-sky-600 shadow-lg" 
                : "hover:bg-sky-200 text-black"
            }`
          }
        >
          <HiOutlineClock className="w-5 h-5 mr-3 group-[.active]:text-sky-600" />
          Sessions
        </NavLink>

        <NavLink
          to="/Users"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
              isActive 
                ? "bg-white text-sky-600 shadow-lg" 
                : "hover:bg-sky-200 text-black"
            }`
          }
        >
          <HiOutlineUsers className="w-5 h-5 mr-3 group-[.active]:text-sky-600" />
          Users
        </NavLink>

        <NavLink
          to="/Resources"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
              isActive 
                ? "bg-white text-sky-600 shadow-lg" 
                : "hover:bg-sky-200 text-black"
            }`
          }
        >
          <HiOutlineDocumentText className="w-5 h-5 mr-3 group-[.active]:text-sky-600" />
          Resources
        </NavLink>

        <NavLink
          to="/CounselorChatRoom"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
              isActive 
                ? "bg-white text-sky-600 shadow-lg" 
                : "hover:bg-sky-200 text-black"
            }`
          }
        >
          <HiOutlineChatAlt2 className="w-5 h-5 mr-3 group-[.active]:text-sky-600" />
          Chat Room
        </NavLink>
      </nav>

      {/* User Profile Section */}
      <div className="px-4 py-3 border-t border-sky-400">
        <div className="flex items-center px-3 py-2 text-gray-700">
          <HiOutlineUser className="w-6 h-6 mr-3 text-sky-600" />
          <div>
            <p className="text-sm font-medium">Counselor</p>
            <p className="text-xs text-gray-600">Professional Account</p>
          </div>
        </div>
      </div>

      {/* Logout Section */}
      <div className="p-4 border-t border-sky-500">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full bg-white text-sky-600 font-semibold px-4 py-3 rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <HiOutlineLogout className="w-5 h-5 mr-2" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;