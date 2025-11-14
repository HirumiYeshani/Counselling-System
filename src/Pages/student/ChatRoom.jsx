import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import Student_sidebar from "../../Components/sidebar/Student_sidebar";
import API from "../../api/api";

const SOCKET_URL = "http://localhost:5000";

const StudentChatRoom = () => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [roomId, setRoomId] = useState("");
  const [counselors, setCounselors] = useState([]);
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [counselorsLoading, setCounselorsLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [hasSelectedCounselor, setHasSelectedCounselor] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) window.location.href = "/login";
    else setUser(storedUser);
  }, []);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    return () => {
      if (roomId && newSocket) {
        newSocket.emit("leaveRoom", roomId);
      }
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchCounselors();
    }
  }, [user]);

  const fetchCounselors = async () => {
    try {
      setCounselorsLoading(true);
      console.log("🔄 Fetching counselors from database...");
      
      const response = await API.get("/debug-users");
      console.log("✅ Debug users response:", response.data);
      
      const debugData = response.data;
      
      if (!debugData.success) {
        throw new Error("Debug endpoint failed");
      }
      
      // Get counselors from the list (they might be in allUsers)
      let counselorsList = [];
      
      if (debugData.counselors && debugData.counselors.list && debugData.counselors.list.length > 0) {
        counselorsList = debugData.counselors.list;
      } else {
        // Fallback: filter from allUsers
        counselorsList = debugData.allUsers.filter(user => 
          user.role && user.role.toLowerCase() === "counselor"
        );
      }
      
      console.log(`🎯 Found ${counselorsList.length} counselors:`, counselorsList);

      if (counselorsList.length === 0) {
        console.log("No counselors found in the database");
        setCounselors([]);
        return;
      }

      // Process counselors data
      const processedCounselors = counselorsList.map(counselor => {
        return {
          _id: counselor._id,
          name: counselor.name || 'Counselor',
          role: counselor.role,
          email: counselor.email || '',
          specialization: counselor.specialization || 'General Counseling',
          phone: counselor.phone || '',
          avatar: counselor.avatar || null
        };
      });

      console.log("✅ Processed counselors:", processedCounselors);
      setCounselors(processedCounselors);

    } catch (error) {
      console.error("❌ Error fetching counselors:", error);
      // Try alternative approach - get all users and filter
      try {
        const allUsersResponse = await API.get("/users");
        const allUsers = allUsersResponse.data?.data || allUsersResponse.data || allUsersResponse;
        
        if (Array.isArray(allUsers)) {
          const counselorsFromAll = allUsers.filter(user => 
            user.role && user.role.toLowerCase() === "counselor"
          );
          
          if (counselorsFromAll.length > 0) {
            const processed = counselorsFromAll.map(c => ({
              _id: c._id,
              name: c.name || 'Counselor',
              role: c.role,
              email: c.email || '',
              specialization: c.specialization || 'General Counseling'
            }));
            
            setCounselors(processed);
          }
        }
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        setCounselors([]);
      }
    } finally {
      setCounselorsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCounselor && user && socket) {
      const room = [user._id, selectedCounselor._id].sort().join("_");
      setRoomId(room);
      setHasSelectedCounselor(true);
      fetchMessages(room);
      joinRoom(room);
    }
  }, [selectedCounselor, user, socket]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (message.roomId === roomId) {
        setMessages(prev => [...prev, message]);
        markAsRead();
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage");
    };
  }, [socket, roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async (room) => {
    try {
      setLoading(true);
      const response = await API.get(`/chat/${room}`);
      const messagesData = response.data?.data || response.data;
      setMessages(Array.isArray(messagesData) ? messagesData : []);
      markAsRead();
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = (room) => {
    if (socket) {
      socket.emit("joinRoom", room);
      console.log(`🚪 Joined room: ${room}`);
    }
  };

  const markAsRead = async () => {
    if (roomId && user) {
      try {
        await API.post("/chat/read", { roomId, userId: user._id });
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedCounselor || !socket) return;

    const msgData = {
      senderId: user._id,
      receiverId: selectedCounselor._id,
      text: newMessage.trim(),
    };

    try {
      console.log("📤 Sending message to:", selectedCounselor.name);
      const response = await API.post("/chat", msgData);
      const savedMessage = response.data?.data || response.data;
      
      setMessages(prev => [...prev, savedMessage]);
      socket.emit("sendMessage", { ...savedMessage, roomId });
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Check if message is from current user
  const isMyMessage = (message) => {
    return message.senderId === user._id || 
           (message.senderId && message.senderId._id === user._id);
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Student_sidebar />
      
      <div className="flex-1 flex">
        {/* Counselors List Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 shadow-sm flex flex-col">
          <div className="p-6 border-b border-gray-200 bg-white flex-shrink-0">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Available Counselors</h2>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {counselors.length} available
              </span>
              <button 
                onClick={fetchCounselors}
                disabled={counselorsLoading}
                className="text-sky-400 hover:text-sky-500 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
            {counselorsLoading ? (
              <div className="flex flex-col justify-center items-center p-8 h-full">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
                <span className="text-gray-500 text-sm">Loading counselors...</span>
              </div>
            ) : counselors.length === 0 ? (
              <div className="p-8 text-center text-gray-500 h-full flex items-center justify-center">
                <div>
                  <div className="text-lg font-medium mb-2">No Counselors Available</div>
                  <p className="text-sm mb-4">Please check back later or contact administration.</p>
                  <button 
                    onClick={fetchCounselors}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              counselors.map(counselor => (
                <div
                  key={counselor._id}
                  className={`p-6 border-b border-gray-100 cursor-pointer transition-all duration-200 ${
                    selectedCounselor?._id === counselor._id 
                      ? "bg-blue-50 border-l-4 border-l-blue-500" 
                      : "hover:bg-gray-50 border-l-4 border-l-transparent"
                  }`}
                  onClick={() => setSelectedCounselor(counselor)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-sky-400 to-sky-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {counselor.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-semibold text-gray-900 truncate">
                        {counselor.name}
                      </p>
                      <p className="text-sm text-blue-600 font-medium mb-1">
                        Professional Counselor
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {counselor.specialization}
                      </p>
                      {counselor.email && (
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {counselor.email}
                        </p>
                      )}
                    </div>
                    {selectedCounselor?._id === counselor._id && (
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {hasSelectedCounselor && selectedCounselor ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                        {selectedCounselor.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                          {selectedCounselor.name}
                        </h1>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-gray-600 font-medium">Online</span>
                          <span className="text-sm text-gray-500">• {selectedCounselor.specialization}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100 p-6" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading conversation...</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col justify-center items-center h-full text-center">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                      <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-2">No messages yet</h3>
                    <p className="text-gray-500 max-w-md">
                      Start a conversation with {selectedCounselor.name}. Send a message to begin your counseling session.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map(message => (
                      <div
                        key={message._id || message.timestamp}
                        className={`flex ${isMyMessage(message) ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-md px-6 py-4 rounded-2xl shadow-sm ${
                            isMyMessage(message)
                              ? "bg-gradient-to-br from-sky-400 to-sky-400 text-white rounded-br-none"
                              : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                          }`}
                        >
                          {!isMyMessage(message) && (
                            <p className="text-sm font-semibold text-blue-600 mb-2">
                              {selectedCounselor.name}
                            </p>
                          )}
                          <p className="text-lg leading-relaxed">{message.text}</p>
                          <p className={`text-xs mt-3 ${isMyMessage(message) ? "text-blue-100" : "text-gray-400"}`}>
                            {new Date(message.createdAt || Date.now()).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 shadow-lg flex-shrink-0 mt-12">
                <div className="p-6">
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={`Message ${selectedCounselor.name}...`}
                      className="flex-1 border border-gray-300 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-gradient-to-br from-sky-400 to-sky-500 text-white px-8 py-4 rounded-2xl  focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md font-semibold text-lg"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Welcome Screen - Shows when no counselor is selected */
            <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-12">
              <div className="text-center max-w-2xl">
                {/* Animated Illustration */}
                <div className="w-60 h-60 mx-auto mb-8 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-sky-500 rounded-full opacity-10 animate-pulse"></div>
                  <div className="absolute inset-8 bg-gradient-to-br from-sky-500 to-sky-400 rounded-full opacity-20 animate-ping"></div>
                  <div className="absolute inset-16 bg-white rounded-full shadow-2xl flex items-center justify-center">
                    <svg className="w-20 h-20 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>

                {/* Welcome Text */}
                <h1 className="text-4xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-sky-400 to-sky-500 bg-clip-text text-transparent">
                  MindEase Chat Room
                </h1>
                
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Connect with professional counselors for support, guidance, and mental health care. 
                  Our team is here to help you navigate academic and personal challenges.
                </p>

               

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentChatRoom;