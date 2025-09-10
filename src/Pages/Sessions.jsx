import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../Components/Sidebar";

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [newSession, setNewSession] = useState({
    userName: "",
    topic: "",
    time: "",
    status: "Scheduled",
  });

  const baseURL = "http://localhost:5000/api/sessions";

  // Fetch sessions
  const fetchSessions = () => {
    axios
      .get(baseURL)
      .then((res) => setSessions(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Add new session
  const handleAddSession = () => {
    axios
      .post(baseURL, newSession)
      .then(() => {
        fetchSessions();
        setNewSession({ userName: "", topic: "", time: "", status: "Scheduled" });
      })
      .catch((err) => console.error(err));
  };

  // Update session status
  const updateStatus = (id, status) => {
    axios
      .put(`${baseURL}/${id}`, { status })
      .then(() => fetchSessions())
      .catch((err) => console.error(err));
  };

  // Delete session
  const deleteSession = (id) => {
    axios
      .delete(`${baseURL}/${id}`)
      .then(() => fetchSessions())
      .catch((err) => console.error(err));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-700 mb-6">Sessions</h1>

        {/* Add Session Form */}
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Schedule New Session</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="User Name"
              value={newSession.userName}
              onChange={(e) => setNewSession({ ...newSession, userName: e.target.value })}
              className="border rounded px-4 py-2"
            />
            <input
              type="text"
              placeholder="Topic"
              value={newSession.topic}
              onChange={(e) => setNewSession({ ...newSession, topic: e.target.value })}
              className="border rounded px-4 py-2"
            />
            <input
              type="datetime-local"
              value={newSession.time}
              onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
              className="border rounded px-4 py-2"
            />
            <button
              onClick={handleAddSession}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              Add Session
            </button>
          </div>
        </div>

        {/* Sessions List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <div
                key={session._id}
                className="bg-white p-5 rounded-xl shadow hover:shadow-2xl transition"
              >
                <h2 className="text-lg font-semibold text-blue-500">{session.userName}</h2>
                <p className="text-gray-600">{session.topic}</p>
                <div className="mt-3 flex justify-between items-center text-gray-700">
                  <span>{new Date(session.time).toLocaleDateString()}</span>
                  <span>
                    {new Date(session.time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <span className="inline-block mt-3 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  {session.status}
                </span>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => updateStatus(session._id, "Completed")}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Mark Completed
                  </button>
                  <button
                    onClick={() => deleteSession(session._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-full text-gray-500 text-center">
              No sessions available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sessions;
