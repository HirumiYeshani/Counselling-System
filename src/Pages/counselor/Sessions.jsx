import React, { useEffect, useState } from "react";
import API from "../../api/api"; // Axios instance with JWT
import Sidebar from "../../Components/sidebar/Sidebar";
import SessionConduct from "../../Components/counselor/sessionConduct";

const Sessions = ({ onUpdateCounts }) => {
  const [sessions, setSessions] = useState([]);
  const [newSession, setNewSession] = useState({
    studentId: "",  // matches dropdown
    topic: "",
    time: "",
    mode: "Real-time", // default value for mode
    status: "Scheduled",
  });
  
  // Session conducting states
  const [selectedSession, setSelectedSession] = useState(null);
  const [isConductingSession, setIsConductingSession] = useState(false);
  const [negativeStressStudents, setNegativeStressStudents] = useState([]);

  // Color constants
  const colors = {
    primary: "#7DD3FC", // sky-300
    secondary: "#38BDF8", // sky-400
    ternary: "#0EA5E9", // sky-500
    primaryDark: "#0284C7", // sky-600
    lightBg: "#F0F9FF" // sky-50
  };

  // ------------------------
  // FETCH SESSIONS
  // ------------------------
  const fetchSessions = async () => {
    try {
      const res = await API.get("/sessions");
      setSessions(res.data);
      onUpdateCounts && onUpdateCounts("sessions", res.data.length); // update dashboard count
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  // ------------------------
  // REFRESH SESSIONS
  // ------------------------
  const refreshSessions = () => {
    fetchSessions();
  };

  useEffect(() => {
    fetchSessions();
    fetchNegativeStressStudents();
  }, []);

  // ------------------------
  // ADD SESSION
  // ------------------------
  const handleAddSession = async () => {
    if (!newSession.studentId || !newSession.topic || !newSession.time) {
      alert("Please fill all required fields!");
      return;
    }
    try {
      await API.post("/sessions", newSession);
      setNewSession({ studentId: "", topic: "", time: "", mode: "Real-time", status: "Scheduled" });
      fetchSessions();
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  // ------------------------
  // UPDATE STATUS
  // ------------------------
  const updateStatus = async (id, status) => {
    try {
      await API.put(`/sessions/${id}`, { status });
      fetchSessions();
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  // ------------------------
  // DELETE SESSION
  // ------------------------
  const deleteSession = async (id) => {
    try {
      await API.delete(`/sessions/${id}`);
      fetchSessions();
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  // ------------------------
  // FETCH NEGATIVE STRESS STUDENTS
  // ------------------------
  const fetchNegativeStressStudents = async () => {
    try {
      const res = await API.get("/sessions/students/negative");
      setNegativeStressStudents(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: colors.lightBg }}>
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="flex-shrink-0 px-4 py-3">
          <div className="flex items-center gap-3 ">
            <div className="p-3 rounded-2xl text-white" style={{ backgroundColor: colors.primary }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Session Management</h1>
            </div>
          </div>
        </div>

        {/* Add Session Form */}
        <div className="flex-shrink-0 px-8 pb-2">
          <div className="bg-white px-6  rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
             
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Student Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                <select
                  value={newSession.studentId || ""}
                  onChange={(e) => setNewSession({ ...newSession, studentId: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                  style={{ focusRingColor: colors.primary }}
                >
                  <option value="">Select Student (High Stress)</option>
                  {negativeStressStudents.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                <input
                  type="text"
                  placeholder="Session topic"
                  value={newSession.topic}
                  onChange={(e) => setNewSession({ ...newSession, topic: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                  style={{ focusRingColor: colors.primary }}
                />
              </div>

              {/* Date & Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date & Time</label>
                <input
                  type="datetime-local"
                  value={newSession.time}
                  onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                  style={{ focusRingColor: colors.primary }}
                />
              </div>

              {/* Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
                <select
                  value={newSession.mode || "Real-time"}
                  onChange={(e) => setNewSession({ ...newSession, mode: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                  style={{ focusRingColor: colors.primary }}
                >
                  <option value="Real-time">Real-time (Chat/Video)</option>
                  <option value="Async">Async (Notes/Resources)</option>
                </select>
              </div>

              {/* Add Session Button */}
              <div className="flex items-end">
                <button
                  onClick={handleAddSession}
                  className="w-full text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                  style={{ backgroundColor: colors.primary }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Session
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 min-h-0 px-8 ">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex-shrink-0 px-4 py-2 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <svg className="w-5 h-5" style={{ color: colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  All Sessions
                </h2>
                <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-xl border">
                  Total: <span className="font-semibold" style={{ color: colors.primary }}>{sessions.length}</span> sessions
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-auto p-">
              {sessions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
                  {sessions.map((session) => (
                    <div
                      key={session._id}
                      className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 group hover:border-blue-200 h-fit"
                    >
                      {/* Session Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
                            {session.student?.name || "Student"}
                          </h2>
                          <p className="text-gray-600 text-sm mt-1">{session.topic}</p>
                        </div>
                        <div className="p-2 rounded-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: `${colors.primary}20` }}>
                          <svg className="w-4 h-4" style={{ color: colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>

                      {/* Time Display */}
                      <div className="mb-4 p-3 rounded-xl border" style={{ backgroundColor: `${colors.lightBg}`, borderColor: colors.primary }}>
                        <div className="flex items-center gap-2 text-sm">
                          <svg className="w-4 h-4" style={{ color: colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium text-gray-700">
                            {new Date(session.time).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm mt-1 ml-6">
                          <svg className="w-4 h-4" style={{ color: colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-600">
                            {new Date(session.time).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Mode Badge */}
                      <div className="mb-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          session.mode === "Real-time" 
                            ? "bg-blue-100 text-blue-800"
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          <span className={`w-2 h-2 rounded-full mr-2 ${
                            session.mode === "Real-time" 
                              ? "bg-blue-500"
                              : "bg-blue-500"
                          }`}></span>
                          {session.mode}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <span 
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            session.status === "Completed" 
                              ? "bg-green-100 text-green-800"
                              : session.status === "Cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          <span 
                            className={`w-2 h-2 rounded-full mr-2 ${
                              session.status === "Completed" 
                                ? "bg-green-500"
                                : session.status === "Cancelled"
                                ? "bg-red-500"
                                : "bg-blue-500"
                            }`}
                          ></span>
                          {session.status}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-1">
                        {/* Conduct Session Button */}
                        <button
                          onClick={() => {
                            setSelectedSession(session);
                            setIsConductingSession(true);
                          }}
                          className="flex-1 bg-sky-400 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-sky-600 transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Conduct
                        </button>
                        
                        <button
                          onClick={() => updateStatus(session._id, "Completed")}
                          className="flex-1 bg-sky-400 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-sky-600 transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Complete
                        </button>
                        <button
                          onClick={() => deleteSession(session._id)}
                          className="flex-1 bg-sky-400 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-sky-600 transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.primary}20` }}>
                      <svg className="w-10 h-10" style={{ color: colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Sessions Available</h3>
                    <p className="text-gray-600 mb-4">Schedule your first counseling session to get started</p>
                    <div className="h-1 w-20 mx-auto rounded-full" style={{ backgroundColor: colors.primary }}></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Session Conducting Modal */}
      {isConductingSession && (
        <SessionConduct
          session={selectedSession}
          onClose={() => {
            setIsConductingSession(false);
            setSelectedSession(null);
          }}
          onUpdate={refreshSessions}
        />
      )}
    </div>
  );
};

export default Sessions;