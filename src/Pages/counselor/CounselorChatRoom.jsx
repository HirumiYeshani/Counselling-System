import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import Counselor_sidebar from "../../Components/sidebar/Sidebar";
import API from "../../api/api";

const SOCKET_URL = "http://localhost:5000";

const CounselorChatRoom = () => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [roomId, setRoomId] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [chatList, setChatList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [hasSelectedStudent, setHasSelectedStudent] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Safe messages array - ALWAYS use this for rendering
  const safeMessages = Array.isArray(messages) ? messages : [];

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
      fetchStudents();
    }
  }, [user]);

  useEffect(() => {
    if (selectedStudent && user && socket) {
      const room = [user._id, selectedStudent._id].sort().join("_");
      setRoomId(room);
      setHasSelectedStudent(true);
      fetchMessages(room);
      joinRoom(room);
    }
  }, [selectedStudent, user, socket]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      console.log("📨 New message received:", message);
      if (message.roomId === roomId) {
        setMessages(prev => Array.isArray(prev) ? [...prev, message] : [message]);
        markAsRead();
      }
      // Refresh students to update unread counts
      fetchStudents();
    };

    const handleUserTyping = (data) => {
      if (data.userId !== user._id) {
        setIsTyping(true);
        setTypingUser(data.userName || 'Student');
        
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          setTypingUser("");
        }, 3000);
      }
    };

    const handleUserStoppedTyping = (data) => {
      if (data.userId !== user._id) {
        setIsTyping(false);
        setTypingUser("");
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("userTyping", handleUserTyping);
    socket.on("userStoppedTyping", handleUserStoppedTyping);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("userTyping", handleUserTyping);
      socket.off("userStoppedTyping", handleUserStoppedTyping);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [socket, roomId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [safeMessages, isTyping]);

  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      console.log("🔄 Fetching students...");
      
      let studentsList = [];

      try {
        console.log("🔍 Trying chat list endpoint...");
        const chatResponse = await API.get(`/chat/chats/${user._id}`);
        console.log("✅ Chat list response:", chatResponse.data);
        
        const chatData = chatResponse.data?.data || chatResponse.data;
        
        if (chatData && Array.isArray(chatData)) {
          setChatList(chatData);
          studentsList = chatData.map(chat => chat.otherUser || chat.student).filter(Boolean);
          console.log(`✅ Found ${studentsList.length} students from chat list`);
        }
      } catch (error) {
        console.log("❌ Chat list endpoint failed:", error.message);
      }

      if (studentsList.length === 0) {
        try {
          console.log("🔍 Trying debug endpoint...");
          const debugResponse = await API.get("/debug-users");
          console.log("✅ Debug response:", debugResponse.data);
          
          const debugData = debugResponse.data;
          
          if (debugData.success) {
            if (debugData.students && debugData.students.list && debugData.students.list.length > 0) {
              studentsList = debugData.students.list;
            } else {
              studentsList = debugData.allUsers.filter(user => 
                user.role && user.role.toLowerCase() === "student"
              );
            }
            console.log(`✅ Found ${studentsList.length} students from debug endpoint`);
          }
        } catch (error) {
          console.log("❌ Debug endpoint failed:", error.message);
        }
      }

      if (studentsList.length === 0) {
        try {
          console.log("🔍 Trying students endpoint...");
          const studentsResponse = await API.get("/chat/users/students");
          console.log("✅ Students response:", studentsResponse.data);
          
          const studentsData = studentsResponse.data?.data || studentsResponse.data;
          
          if (Array.isArray(studentsData)) {
            studentsList = studentsData;
            console.log(`✅ Found ${studentsList.length} students from students endpoint`);
          }
        } catch (error) {
          console.log("❌ Students endpoint failed:", error.message);
        }
      }

      if (studentsList.length === 0) {
        try {
          console.log("🔍 Trying basic users endpoint...");
          const usersResponse = await API.get("/users");
          console.log("✅ Users response:", usersResponse.data);
          
          const usersData = usersResponse.data?.data || usersResponse.data;
          
          if (Array.isArray(usersData)) {
            studentsList = usersData.filter(user => 
              user.role && user.role.toLowerCase() === "student"
            );
            console.log(`✅ Found ${studentsList.length} students from users endpoint`);
          }
        } catch (error) {
          console.log("❌ Users endpoint failed:", error.message);
        }
      }

      const processedStudents = studentsList.map(student => {
        return {
          _id: student._id,
          name: student.name || 'Student',
          role: student.role,
          email: student.email || '',
          phone: student.phone || '',
          avatar: student.avatar || null
        };
      });

      console.log(`🎯 Final students list:`, processedStudents);
      setStudents(processedStudents);

    } catch (error) {
      console.error("❌ Error fetching students:", error);
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  const fetchMessages = async (room) => {
    try {
      setLoading(true);
      console.log(`📨 Fetching messages for room: ${room}`);
      const response = await API.get(`/chat/${room}`);
      console.log("📨 Messages API response:", response.data);
      
      let messagesData = [];
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          messagesData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          messagesData = response.data.data;
        } else if (response.data.messages && Array.isArray(response.data.messages)) {
          messagesData = response.data.messages;
        } else if (typeof response.data === 'object') {
          messagesData = [response.data];
        } else {
          console.warn("Unexpected messages format:", response.data);
        }
      }
      
      console.log(`📝 Processed messages data:`, messagesData);
      setMessages(messagesData);
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
      console.log(`🚪 Counselor joined room: ${room}`);
    }
  };

  const markAsRead = async () => {
    if (roomId && user) {
      try {
        await API.post("/chat/read", { roomId, userId: user._id });
        console.log("✅ Messages marked as read");
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleTyping = () => {
    if (socket && roomId && selectedStudent) {
      socket.emit("typingStart", {
        roomId,
        userId: user._id,
        userName: user.name
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typingStop", { roomId, userId: user._id });
      }, 1000);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedStudent || !socket) return;

    const msgData = {
      senderId: user._id,
      receiverId: selectedStudent._id,
      text: newMessage.trim(),
    };

    try {
      console.log("📤 Sending message to:", selectedStudent.name);
      const response = await API.post("/chat", msgData);
      const savedMessage = response.data?.data || response.data;
      console.log("✅ Message saved:", savedMessage);
      
      setMessages(prev => Array.isArray(prev) ? [...prev, savedMessage] : [savedMessage]);
      socket.emit("sendMessage", { ...savedMessage, roomId });
      
      socket.emit("typingStop", { roomId, userId: user._id });
      
      setNewMessage("");
      fetchStudents();
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

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    handleTyping();
  };

  const getUnreadCount = (studentId) => {
    const chat = chatList.find(chat => 
      (chat.otherUser && chat.otherUser._id === studentId) || 
      (chat.student && chat.student._id === studentId)
    );
    return chat ? chat.unreadCount || 0 : 0;
  };

  // Check if message is from current user (counselor)
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
      <Counselor_sidebar />
      
      <div className="flex-1 flex">
        {/* Students List */}
        <div className="w-80 bg-white border-r border-gray-200 shadow-sm flex flex-col">
          <div className="p-6 border-b border-gray-200 bg-white flex-shrink-0">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Students</h2>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {students.length} connected
              </span>
              <button 
                onClick={fetchStudents}
                disabled={studentsLoading}
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
            {studentsLoading ? (
              <div className="flex flex-col justify-center items-center p-8 h-full">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
                <span className="text-gray-500 text-sm">Loading students...</span>
                <span className="text-gray-400 text-xs mt-2">Checking database</span>
              </div>
            ) : students.length === 0 ? (
              <div className="p-8 text-center text-gray-500 h-full flex items-center justify-center">
                <div>
                  <div className="text-lg font-medium mb-2">No Students Available</div>
                  <p className="text-sm mb-4">Students will appear here when they start conversations with you.</p>
                  <button 
                    onClick={fetchStudents}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    Check Again
                  </button>
                </div>
              </div>
            ) : (
              students.map(student => (
                <div
                  key={student._id}
                  className={`p-6 border-b border-gray-100 cursor-pointer transition-all duration-200 ${
                    selectedStudent?._id === student._id 
                      ? "bg-blue-50 border-l-4 border-l-blue-500" 
                      : "hover:bg-gray-50 border-l-4 border-l-transparent"
                  }`}
                  onClick={() => setSelectedStudent(student)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-sky-400 to-sky-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-semibold text-gray-900 truncate">
                          {student.name}
                        </p>
                        <p className="text-sm text-blue-600 font-medium mb-1">
                          Student
                        </p>
                        {student.email && (
                          <p className="text-sm text-gray-600 truncate">
                            {student.email}
                          </p>
                        )}
                      </div>
                    </div>
                    {getUnreadCount(student._id) > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
                        {getUnreadCount(student._id)}
                      </span>
                    )}
                    {selectedStudent?._id === student._id && (
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

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {hasSelectedStudent && selectedStudent ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                        {selectedStudent.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                          {selectedStudent.name}
                        </h1>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-gray-600 font-medium">Online</span>
                          <span className="text-sm text-gray-500">• Student</span>
                        </div>
                        {selectedStudent.email && (
                          <p className="text-sm text-gray-500 mt-1">{selectedStudent.email}</p>
                        )}
                      </div>
                    </div>
                    {getUnreadCount(selectedStudent._id) > 0 && (
                      <span className="bg-red-500 text-white text-sm rounded-full px-3 py-1 font-medium">
                        {getUnreadCount(selectedStudent._id)} unread
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100 p-6" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading conversation...</p>
                    </div>
                  </div>
                ) : safeMessages.length === 0 ? (
                  <div className="flex flex-col justify-center items-center h-full text-center">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                      <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-2">No messages yet</h3>
                    <p className="text-gray-500 max-w-md">
                      Start a conversation with {selectedStudent.name}. Send a welcome message to begin.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {safeMessages.map(message => (
                      <div
                        key={message._id || message.timestamp || Math.random()}
                        className={`flex ${isMyMessage(message) ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-md px-6 py-4 rounded-2xl shadow-sm ${
                            isMyMessage(message)
                              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-none"
                              : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                          }`}
                        >
                          {!isMyMessage(message) && (
                            <p className="text-sm font-semibold text-blue-600 mb-2">
                              {selectedStudent?.name || 'Student'}
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
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="max-w-md px-6 py-4 rounded-2xl shadow-sm bg-white border border-gray-200 rounded-bl-none">
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="text-sm text-gray-500">{typingUser} is typing...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 shadow-lg flex-shrink-0 mt-20">
                <div className="p-6">
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      placeholder={`Message ${selectedStudent.name}...`}
                      className="flex-1 border border-gray-300 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-8 py-4 rounded-2xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md font-semibold text-lg"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Welcome Screen - Shows when no student is selected */
            <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-12">
              <div className="text-center max-w-2xl">
                {/* Animated Illustration */}
                <div className="w-60 h-60 mx-auto mb-8 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-sky-500 rounded-full opacity-10 animate-pulse"></div>
                  <div className="absolute inset-8 bg-gradient-to-br from-sky-500 to-sky-600 rounded-full opacity-20 animate-ping"></div>
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
                  Connect with students for support, guidance, and mental health care. 
                  Provide professional assistance to help them navigate academic and personal challenges.
                </p>
           
               
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CounselorChatRoom;