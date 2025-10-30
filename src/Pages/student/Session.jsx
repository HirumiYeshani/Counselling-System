import React, { useState, useEffect } from "react";
import API from "../../api/api";
import Student_sidebar from "../../Components/sidebar/Student_sidebar";

const StudentSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isViewingSession, setIsViewingSession] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const colors = {
    primary: "#7DD3FC",
    secondary: "#38BDF8", 
    ternary: "#0EA5E9",
    primaryDark: "#0284C7",
    lightBg: "#F0F9FF"
  };

  // Get student info from authentication
  const getStudentInfo = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      
      if (!userData) {
        const sessionData = JSON.parse(sessionStorage.getItem('user'));
        if (sessionData) {
          return sessionData;
        }
      }
      
      if (userData) {
        console.log("👤 Student info found:", userData);
        return userData;
      }
      
      console.warn("⚠️ No user data found in storage, using fallback");
      return { name: "John Doe", id: "test-student-id" };
      
    } catch (error) {
      console.error("❌ Error getting student info:", error);
      return null;
    }
  };

  // Fetch student's sessions
  const fetchStudentSessions = async () => {
    try {
      setIsLoading(true);
      
      const studentInfo = getStudentInfo();
      if (!studentInfo) {
        console.log("❌ No student info available");
        return;
      }

      console.log("🔄 Fetching sessions for student:", studentInfo.name, "ID:", studentInfo.id);
      
      let res;
      if (studentInfo.id && studentInfo.id !== "test-student-id") {
        res = await API.get(`/sessions/student/sessions?studentId=${studentInfo.id}`);
        console.log("✅ Fetched by ID, sessions:", res.data.length);
      } else if (studentInfo.name) {
        res = await API.get(`/sessions/student/sessions?studentName=${encodeURIComponent(studentInfo.name)}`);
        console.log("✅ Fetched by name, sessions:", res.data.length);
      } else {
        console.log("❌ No student ID or name available");
        return;
      }
      
      setSessions(res.data);
      setLastUpdate(Date.now());
      setStudentName(studentInfo.name);
      setStudentId(studentInfo.id);
      
    } catch (err) {
      console.error("❌ Failed to fetch sessions:", err.response?.data || err.message);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Set student info on component mount
  useEffect(() => {
    const studentInfo = getStudentInfo();
    if (studentInfo) {
      setStudentName(studentInfo.name);
      setStudentId(studentInfo.id);
    }
  }, []);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (studentName || studentId) {
      fetchStudentSessions();
      
      const intervalId = setInterval(() => {
        fetchStudentSessions();
      }, 5000);
      
      return () => clearInterval(intervalId);
    }
  }, [studentName, studentId]);

  // Manual refresh function
  const handleManualRefresh = () => {
    fetchStudentSessions();
  };

  // Send chat message with immediate UI update
  const sendChatMessage = async () => {
    if (!chatMessage.trim() || !selectedSession || isSendingMessage) return;

    setIsSendingMessage(true);
    try {
      // 1. Create temporary message
      const tempMessage = {
        _id: `temp-${Date.now()}`,
        sender: "student",
        message: chatMessage,
        timestamp: new Date()
      };

      // 2. Update sessions state immediately
      const updatedSessions = sessions.map(session => {
        if (session._id === selectedSession._id) {
          return {
            ...session,
            chatMessages: [...(session.chatMessages || []), tempMessage]
          };
        }
        return session;
      });
      
      setSessions(updatedSessions);
      
      // 3. Update selected session for the modal view
      const updatedSelectedSession = {
        ...selectedSession,
        chatMessages: [...(selectedSession.chatMessages || []), tempMessage]
      };
      setSelectedSession(updatedSelectedSession);
      
      // 4. Clear input immediately
      const messageToSend = chatMessage;
      setChatMessage("");

      console.log("📝 Student optimistic update:", {
        sessionId: selectedSession._id,
        message: messageToSend
      });

      // 5. Send to server
      const response = await API.post(`/sessions/${selectedSession._id}/chat`, {
        sender: "student",
        message: messageToSend
      });

      console.log("✅ Student server response:", response.data.chatMessages?.length);

      // 6. Update with server response
      const finalUpdatedSessions = sessions.map(session => {
        if (session._id === selectedSession._id) {
          return response.data;
        }
        return session;
      });
      
      setSessions(finalUpdatedSessions);
      setSelectedSession(response.data);
      
    } catch (err) {
      console.error("❌ Failed to send message:", err);
      alert("Failed to send message. Please try again.");
      
      // Revert on error
      fetchStudentSessions();
      if (selectedSession) {
        const originalSession = sessions.find(s => s._id === selectedSession._id);
        setSelectedSession(originalSession);
      }
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Join Zoom meeting
  const joinZoomMeeting = (session) => {
    if (session.zoomMeeting?.joinUrl) {
      window.open(session.zoomMeeting.joinUrl, '_blank');
    } else {
      alert('No Zoom meeting link available for this session');
    }
  };

  const openSession = (session) => {
    setSelectedSession(session);
    setIsViewingSession(true);
  };

  const closeSession = () => {
    setIsViewingSession(false);
    setSelectedSession(null);
    setChatMessage("");
  };

  // Check if session is new (created in last 30 seconds)
  const isNewSession = (session) => {
    return Date.now() - new Date(session.createdAt).getTime() < 30000;
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: colors.lightBg }}>
      <Student_sidebar/>

      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="flex-shrink-0 p-8 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-2xl text-white" style={{ backgroundColor: colors.primary }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Counseling Sessions</h1>
              <p className="text-gray-600 mt-1">Welcome, {studentName || "Student"}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">Auto-updating every 5 seconds</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 min-h-0 px-8 pb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex-shrink-0 p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <svg className="w-5 h-5" style={{ color: colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  My Sessions {studentName && `for ${studentName}`}
                </h2>
                
                <div className="flex items-center gap-4">
                  {/* Refresh Button */}
                  <button
                    onClick={handleManualRefresh}
                    disabled={isLoading}
                    className="bg-sky-400 text-white px-4 py-2 rounded-xl hover:bg-sky-500 transition-all duration-200 transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                    {isLoading ? "Refreshing..." : "Refresh Now"}
                  </button>
                  
                  <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-xl border">
                    Total: <span className="font-semibold" style={{ color: colors.primary }}>{sessions.length}</span> sessions
                  </div>
                </div>
              </div>
              
              {/* Last Updated Time */}
              <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                <span>Last updated: {new Date(lastUpdate).toLocaleTimeString()}</span>
                {isLoading && (
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    Updating...
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-auto p-6">
              {!studentName ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center bg-yellow-100">
                      <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Authentication Required</h3>
                    <p className="text-gray-600 mb-4">Please log in to view your sessions</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="bg-blue-500 text-white px-6 py-2 rounded-xl hover:bg-blue-600 transition-colors"
                    >
                      Reload Page
                    </button>
                  </div>
                </div>
              ) : sessions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
                  {sessions.map((session) => (
                    <div
                      key={session._id}
                      className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 group hover:border-blue-200 h-fit relative"
                    >
                      {/* New Session Badge */}
                      {isNewSession(session) && (
                        <div className="absolute -top-2 -right-2">
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                            NEW
                          </span>
                        </div>
                      )}

                      {/* Session Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
                            {session.topic}
                          </h2>
                          <p className="text-gray-600 text-sm mt-1">
                            With {session.counselor?.name || "Counselor"}
                          </p>
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
                            ? "bg-sky-100 text-blue-600"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
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
                          {session.status}
                        </span>
                      </div>

                      {/* Zoom Meeting Info */}
                      {session.zoomMeeting && session.mode === "Real-time" && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                          <div className="flex items-center gap-2 text-sm text-blue-800 mb-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span className="font-medium">Zoom Meeting Ready</span>
                          </div>
                          {session.zoomMeeting.password && (
                            <p className="text-xs text-blue-600">
                              Password: <strong>{session.zoomMeeting.password}</strong>
                            </p>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {/* Join Zoom Button for Real-time sessions */}
                        {session.mode === "Real-time" && session.status === "Scheduled" && session.zoomMeeting && (
                          <button
                            onClick={() => joinZoomMeeting(session)}
                            className="flex-1 bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-600 transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Join Zoom
                          </button>
                        )}
                        
                        {/* View/Details Button */}
                        <button
                          onClick={() => openSession(session)}
                          disabled={session.status === "Cancelled"}
                          className={`flex-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 ${
                            session.status === "Cancelled"
                              ? "bg-gray-400 text-white cursor-not-allowed"
                              : "bg-sky-400 text-white hover:bg-sky-500"
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {session.status === "Completed" ? "View" : "Details"}
                        </button>
                      </div>

                      {/* Unread Messages Badge */}
                      {session.chatMessages && session.chatMessages.length > 0 && (
                        <div className="mt-3 text-xs text-blue-600 font-medium flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          {session.chatMessages.length} message(s)
                        </div>
                      )}
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
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Sessions Scheduled</h3>
                    <p className="text-gray-600 mb-4">Your counselor will schedule sessions for you</p>
                    <div className="h-1 w-20 mx-auto rounded-full" style={{ backgroundColor: colors.primary }}></div>
                    <button
                      onClick={handleManualRefresh}
                      className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Check for New Sessions
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Session View Modal */}
      {isViewingSession && selectedSession && (
        <StudentSessionView
          session={selectedSession}
          onClose={closeSession}
          onSendMessage={sendChatMessage}
          chatMessage={chatMessage}
          setChatMessage={setChatMessage}
          isSendingMessage={isSendingMessage}
        />
      )}
    </div>
  );
};

// Student Session View Component
const StudentSessionView = ({ session, onClose, onSendMessage, chatMessage, setChatMessage, isSendingMessage }) => {
  const [activeTab, setActiveTab] = useState("chat");

  // Join Zoom meeting
  const joinZoomMeeting = () => {
    if (session.zoomMeeting?.joinUrl) {
      window.open(session.zoomMeeting.joinUrl, '_blank');
    } else {
      alert('No Zoom meeting link available for this session');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-sky-400 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">
                {session.status === "Completed" ? "Viewing Session" : "Active Session"}
              </h2>
              <p className="text-green-100">
                With {session.counselor?.name || "Counselor"} - {session.topic}
              </p>
              <div className="text-sm text-sky-100 mt-1">
                Messages: {session.chatMessages?.length || 0}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-sky-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {["chat", "zoom", "resources", "goals", "action"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-sky-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto">
          {/* Chat Tab */}
          {activeTab === "chat" && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto">
                {session.chatMessages?.map((msg, index) => (
                  <div
                    key={msg._id || index}
                    className={`mb-3 ${
                      msg.sender === "student" ? "text-right" : "text-left"
                    }`}
                  >
                    <div
                      className={`inline-block px-4 py-2 rounded-2xl max-w-xs ${
                        msg.sender === "student"
                          ? "bg-sky-500 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {msg.message}
                      {msg._id?.startsWith('temp-') && " ⏳"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                      {msg._id?.startsWith('temp-') && " (Sending...)"}
                    </div>
                  </div>
                ))}
                {(!session.chatMessages || session.chatMessages.length === 0) && (
                  <p className="text-gray-500 text-center py-8">
                    {session.status === "Completed" 
                      ? "No messages in this completed session" 
                      : "No messages yet. Start the conversation!"}
                  </p>
                )}
              </div>
              
              {/* Chat input - only for active sessions */}
              {session.status === "Scheduled" && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
                    placeholder="Type your message to counselor..."
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={isSendingMessage}
                  />
                  <button
                    onClick={onSendMessage}
                    disabled={isSendingMessage || !chatMessage.trim()}
                    className="bg-sky-400 text-white px-6 py-2 rounded-xl hover:bg-sky-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isSendingMessage ? "Sending..." : "Send"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Zoom Tab */}
          {activeTab === "zoom" && (
            <div className="space-y-4">
              {session.zoomMeeting ? (
                <div className="space-y-4">
                  <div className="bg-purple-50 border border-green-200 rounded-xl p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">Zoom Meeting Information</h3>
                    <div className="space-y-2 text-sm">
                      {session.zoomMeeting.password && (
                        <p><strong>Password:</strong> {session.zoomMeeting.password}</p>
                      )}
                      <p><strong>Status:</strong> Ready to join</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={joinZoomMeeting}
                    className="w-full bg-sky-400 text-white px-6 py-3 rounded-xl hover:bg-sky-500 transition-colors flex items-center justify-center gap-2 text-lg font-semibold"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Join Zoom Meeting
                  </button>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="font-medium text-blue-800 mb-2">Meeting Link:</h4>
                    <p className="text-sm text-blue-600 break-all">{session.zoomMeeting.joinUrl}</p>
                    <button
                      onClick={() => navigator.clipboard.writeText(session.zoomMeeting.joinUrl)}
                      className="mt-2 bg-sky-400 text-white px-3 py-1 rounded text-sm hover:bg-sky-500 transition-colors"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No Zoom Meeting</h3>
                  <p className="text-gray-600">Your counselor will create a Zoom meeting for this session</p>
                </div>
              )}
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === "resources" && (
            <div className="space-y-4 h-[490px]">
              {session.resources && session.resources.length > 0 ? (
                session.resources.map((resource, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4">
                    <p className="text-gray-800">{resource}</p>
                    {resource.startsWith('http') && (
                      <a 
                        href={resource} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sky-400 hover:text-sky-500 text-sm mt-2 inline-block"
                      >
                        Open Resource →
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No resources shared yet</p>
              )}
            </div>
          )}

          {/* Goals Tab */}
          {activeTab === "goals" && (
            <div className="space-y-4">
              {session.goals ? (
                <div className="bg-purple-50 border  rounded-xl p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">Session Goals:</h3>
                  <p className="text-blue-700 whitespace-pre-wrap">{session.goals}</p>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No goals set for this session yet</p>
              )}
            </div>
          )}

          {/* Action Plan Tab */}
          {activeTab === "action" && (
            <div className="space-y-4">
              {session.actionPlan ? (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">Action Plan:</h3>
                  <p className="text-blue-700 whitespace-pre-wrap">{session.actionPlan}</p>
                  {session.followUpDate && (
                    <div className="mt-4 p-3 bg-white rounded-lg border">
                      <h4 className="font-medium text-blue-800 mb-1">Follow-up Date:</h4>
                      <p className="text-blue-600">
                        {new Date(session.followUpDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No action plan created for this session yet</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <button
            onClick={onClose}
            className="bg-blue-700 text-white px-6 py-2 rounded-xl hover:bg-blue-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentSessions;