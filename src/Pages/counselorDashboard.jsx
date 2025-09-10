import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../Components/Sidebar";

const CounselorDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [resources, setResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // 🔹 new state

  // Fetch data on mount
  useEffect(() => {
    const baseURL = "http://localhost:5000/api";

    axios.get(`${baseURL}/sessions`).then((res) => setSessions(res.data)).catch(console.error);
    axios.get(`${baseURL}/users`).then((res) => setUsers(res.data)).catch(console.error);
    axios.get(`${baseURL}/feedback`).then((res) => setFeedback(res.data)).catch(console.error);
    axios.get(`${baseURL}/resources`).then((res) => setResources(res.data)).catch(console.error);
  }, []);

  // 🔹 Filter function (case-insensitive)
  const filterData = (data, fields) => {
    return data.filter((item) =>
      fields.some((field) =>
        item[field]?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  };

  // Apply filters
  const filteredUsers = filterData(users, ["name", "email", "role"]);
  const filteredSessions = filterData(sessions, ["userName", "topic"]);
  const filteredFeedback = filterData(feedback, ["userName", "comment"]);
  const filteredResources = filterData(resources, ["title", "description", "category"]);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-700">Dashboard</h1>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery} // 🔹 controlled input
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center">
            <div className="text-5xl font-bold text-blue-500">{filteredUsers.length}</div>
            <p className="mt-2 text-gray-600 font-semibold">Users</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center">
            <div className="text-5xl font-bold text-blue-500">{filteredSessions.length}</div>
            <p className="mt-2 text-gray-600 font-semibold">Sessions</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center">
            <div className="text-5xl font-bold text-blue-500">{filteredResources.length}</div>
            <p className="mt-2 text-gray-600 font-semibold">Resources</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center">
            <div className="text-5xl font-bold text-blue-500">{filteredFeedback.length}</div>
            <p className="mt-2 text-gray-600 font-semibold">Feedback</p>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4 text-gray-700">Upcoming Sessions</h2>
            {filteredSessions.length > 0 ? (
              <ul className="space-y-3">
                {filteredSessions.map((session) => (
                  <li
                    key={session._id}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <span className="font-medium">
                      {session.userName} - {session.topic}
                    </span>
                    <span className="text-gray-500">
                      {new Date(session.time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No sessions found</p>
            )}
          </div>

          {/* Recent Feedback */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4 text-gray-700">Recent Feedback</h2>
            {filteredFeedback.length > 0 ? (
              <ul className="space-y-3">
                {filteredFeedback.map((fb) => (
                  <li key={fb._id} className="border-b pb-2">
                    <span className="font-semibold">{fb.userName}:</span> {fb.comment}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No feedback found</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-6 rounded-xl shadow flex flex-wrap gap-4 mb-8">
          <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
            Schedule New Session
          </button>
          <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
            Add Resource
          </button>
          <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
            View Feedback
          </button>
        </div>

        {/* Resources */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4 text-gray-700">Resources for Users</h2>
          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredResources.map((res) => (
                <div
                  key={res._id}
                  className="bg-blue-100 p-4 rounded-lg hover:bg-blue-200 transition"
                >
                  {res.title}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No resources found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CounselorDashboard;
