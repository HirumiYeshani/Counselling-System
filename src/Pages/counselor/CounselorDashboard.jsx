import React, { useEffect, useState, useCallback } from "react";
import API from "../../api/api"; // Axios instance with JWT
import Sidebar from "../../Components/sidebar/Sidebar";

const CounselorDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [resources, setResources] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user")); // logged-in counselor

  // Color constants
  const colors = {
    primary: "#C4B5FD", 
    secondary: "#38BDF8",
    ternary: "#FECACA", 
    primaryDark: "#10B981",
    secondaryDark: "#0EA5E9",
    lightBg: "#F8FAFC"
  };

  // ------------------------
  // FETCH FUNCTIONS
  // ------------------------
  const fetchUsers = useCallback(async () => {
    try {
      const res = await API.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  }, []);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await API.get("/sessions");
      setSessions(res.data);
    } catch (err) {
      console.error("Error fetching sessions:", err);
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      if (!user?._id) return;
      const res = await API.get(`/bookings?counselorId=${user._id}`);
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  }, [user?._id]);

  const fetchResources = useCallback(async () => {
    try {
      const res = await API.get("/resources");
      setResources(res.data);
    } catch (err) {
      console.error("Error fetching resources:", err);
    }
  }, []);

  const fetchFeedback = useCallback(async () => {
    try {
      const res = await API.get("/feedback");
      setFeedback(res.data);
    } catch (err) {
      console.error("Error fetching feedback:", err);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      if (!user?._id) return;
      const res = await API.get(`/notifications/${user._id}`);
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }, [user?._id]);

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/read/${id}`);
      setNotifications(
        notifications.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const fetchResponseDetails = async (responseId) => {
    try {
      const res = await API.get(`/responses/${responseId}`);
      setSelectedResponse(res.data);
      setSelectedStudent(res.data.studentId);
      setShowDropdown(false);
    } catch (err) {
      console.error("Error fetching response details:", err);
    }
  };

  // Handle booking actions
  const handleBookingAction = async (bookingId, action, reason = "") => {
    try {
      setIsLoading(true);
      const res = await API.patch(`/bookings/${bookingId}/status`, {
        status: action,
        cancellationReason: reason
      });

      if (res.data.success) {
        // Refresh bookings and notifications
        await fetchBookings();
        await fetchNotifications();
        setSelectedBooking(null);
        alert(`Booking ${action} successfully!`);
      }
    } catch (err) {
      console.error(`Error ${action} booking:`, err);
      alert(`Failed to ${action} booking: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  // ------------------------
  // INITIAL DATA FETCH
  // ------------------------
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchUsers(),
          fetchSessions(),
          fetchBookings(),
          fetchResources(),
          fetchFeedback(),
          fetchNotifications()
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [fetchUsers, fetchSessions, fetchBookings, fetchResources, fetchFeedback, fetchNotifications]);

  // ------------------------
  // FILTER FUNCTION
  // ------------------------
  const filterData = (data, fields) => {
    if (!searchQuery.trim()) return data;
    return data.filter((item) =>
      fields.some((field) =>
        item[field]?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  };

  const filteredUsers = filterData(users, ["name", "email", "role"]);
  const filteredSessions = filterData(sessions, ["userName", "topic"]);
  const filteredBookings = filterData(bookings, ["studentName", "topic", "status"]);
  const filteredResources = filterData(resources, ["title", "description", "category"]);
  const filteredFeedback = filterData(feedback, ["userName", "comment"]);

  const handleSearch = (e) => e.preventDefault();

  // Get recent items for overview
  const recentSessions = filteredSessions.slice(0, 3);
  const pendingBookings = filteredBookings.filter(b => b.status === 'pending').slice(0, 5);
  const recentFeedback = filteredFeedback.slice(0, 3);

  // Count notifications for badge
  const pendingBookingsCount = bookings.filter(b => b.status === 'pending').length;
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const totalNotificationCount = unreadNotificationsCount + pendingBookingsCount;

  // Separate notifications by type
  const questionnaireNotifications = notifications.filter(n => 
    n.type === 'questionnaire' || n.responseId || n.message?.toLowerCase().includes('assessment') || n.message?.toLowerCase().includes('questionnaire')
  );
  
  const bookingNotifications = notifications.filter(n => 
    n.type === 'booking' || n.message?.toLowerCase().includes('booking') || n.message?.toLowerCase().includes('session')
  );
  
  const otherNotifications = notifications.filter(n => 
    !questionnaireNotifications.includes(n) && !bookingNotifications.includes(n)
  );

  const unreadQuestionnaireCount = questionnaireNotifications.filter(n => !n.read).length;
  const unreadBookingCount = bookingNotifications.filter(n => !n.read).length;

  return (
    <div className="flex h-screen" style={{ backgroundColor: colors.lightBg }}>
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        )}

        {/* Header with Notifications */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Counselor Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.name || "Counselor"}</p>
          </div>

          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search users, sessions, resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-3 pl-10 w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                style={{ borderColor: colors.primary }}
              />
              <svg 
                className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </form>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="relative p-3 bg-primary rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-primary group"
                style={{ borderColor: colors.primary }}
              >
                <svg 
                  className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.24 8.56a5.97 5.97 0 01-4.66-6.24M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {totalNotificationCount > 0 && (
                  <span 
                    className="absolute top-1 right-1 inline-block w-3 h-3 rounded-full border-2 border-white animate-pulse"
                    style={{ backgroundColor: colors.secondaryDark }}
                  ></span>
                )}
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-96 max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                  <div 
                    className="p-4 border-b border-gray-100 rounded-t-xl"
                    style={{ background: `linear-gradient(135deg, ${colors.secondary}, ${colors.secondary})` }}
                  >
                    <h3 className="font-semibold text-white">Notifications</h3>
                    <p className="text-white text-sm opacity-90">
                      {pendingBookingsCount > 0 && `${pendingBookingsCount} pending booking(s)`}
                      {pendingBookingsCount > 0 && unreadNotificationsCount > 0 && " • "}
                      {unreadNotificationsCount > 0 && `${unreadNotificationsCount} unread message(s)`}
                    </p>
                  </div>
                  
                  {/* Pending Bookings Section */}
                  {pendingBookingsCount > 0 && (
                    <div className="border-b border-gray-100">
                      <div className="p-3 bg-blue-50 border-l-4 border-blue-400">
                        <p className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                          <span>📅</span>
                          Pending Session Requests ({pendingBookingsCount})
                        </p>
                      </div>
                      {pendingBookings.map((booking) => (
                        <div
                          key={`booking-${booking._id}`}
                          className="p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-blue-50 group"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                New Session Request: {booking.topic}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                From: {booking.studentName}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Preferred: {new Date(booking.preferredDate).toLocaleDateString()} at {booking.preferredTime}
                              </p>
                              <p className="text-xs text-gray-500">
                                Urgency: 
                                <span className={`ml-1 px-1 rounded ${
                                  booking.urgency === 'high' ? 'bg-blue-100 text-blue-800' :
                                  booking.urgency === 'medium' ? 'bg-blue-100 text-blue-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {booking.urgency}
                                </span>
                              </p>
                            </div>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                              Action Required
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Questionnaire Notifications Section */}
                  {questionnaireNotifications.length > 0 && (
                    <div className="border-b border-gray-100">
                      <div className="p-3 bg-purple-50 border-l-4 border-blue-400">
                        <p className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                          <span>📝</span>
                          Questionnaire Responses ({unreadQuestionnaireCount} unread)
                        </p>
                      </div>
                      {questionnaireNotifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => {
                            markAsRead(n._id);
                            if (n.responseId) fetchResponseDetails(n.responseId);
                          }}
                          className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-purple-50 group
                            ${n.read ? "bg-white" : "bg-purple-50 border-l-4"}
                          `}
                          style={{ borderLeftColor: n.read ? 'transparent' : colors.primary }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className={`${n.read ? "text-gray-600" : "text-gray-800 font-semibold"} group-hover:text-blue-600 transition-colors`}>
                                {n.message}
                              </p>
                              <span className="text-xs text-gray-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {!n.read && (
                              <span 
                                className="ml-2 font-bold animate-pulse flex-shrink-0"
                                style={{ color: colors.primary }}
                              >●</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Booking Notifications Section */}
                  {bookingNotifications.length > 0 && (
                    <div className="border-b border-gray-100">
                      <div className="p-3 bg-blue-50 border-l-4 border-blue-400">
                        <p className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                          <span>📅</span>
                          Booking Updates ({unreadBookingCount} unread)
                        </p>
                      </div>
                      {bookingNotifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => markAsRead(n._id)}
                          className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-blue-50 group
                            ${n.read ? "bg-white" : "bg-blue-50 border-l-4"}
                          `}
                          style={{ borderLeftColor: n.read ? 'transparent' : colors.secondary }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className={`${n.read ? "text-gray-600" : "text-gray-800 font-semibold"} group-hover:text-blue-600 transition-colors`}>
                                {n.message}
                              </p>
                              <span className="text-xs text-gray-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {!n.read && (
                              <span 
                                className="ml-2 font-bold animate-pulse flex-shrink-0"
                                style={{ color: colors.secondary }}
                              >●</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Other Notifications Section */}
                  {otherNotifications.length > 0 && (
                    <div>
                      <div className="p-3 bg-gray-50 border-l-4 border-gray-400">
                        <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                          <span>🔔</span>
                          Other Notifications
                        </p>
                      </div>
                      {otherNotifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => markAsRead(n._id)}
                          className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-gray-50 group
                            ${n.read ? "bg-white" : "bg-gray-50 border-l-4"}
                          `}
                          style={{ borderLeftColor: n.read ? 'transparent' : '#6B7280' }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className={`${n.read ? "text-gray-600" : "text-gray-800 font-semibold"} group-hover:text-gray-600 transition-colors`}>
                                {n.message}
                              </p>
                              <span className="text-xs text-gray-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {!n.read && (
                              <span 
                                className="ml-2 font-bold animate-pulse flex-shrink-0 text-gray-500"
                              >●</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Empty State */}
                  {notifications.length === 0 && pendingBookingsCount === 0 && (
                    <div className="px-4 py-6 text-gray-500 text-center">
                      <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>No notifications</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Quick Actions */}
        <div className="p-8 rounded-2xl shadow-lg mb-8" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
          <h2 className="text-3xl font-bold text-black mb-6">Quick Actions</h2>
          <div className="flex flex-wrap gap-4 text-lg">
            {[ 
              { label: "Manage Sessions", icon: "📅", path: "/sessions" },
              { label: "Manage Users", icon: "👥", path: "/users" },
              { label: "Manage Resources", icon: "📚", path: "/resources" },
              { label: "View Feedback", icon: "💬", path: "/feedback" }
            ].map((action, index) => (
              <button key={index} onClick={() => window.location.href = action.path} className="bg-white text-gray-800 px-6 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-3 group">
                <span className="text-xl">{action.icon}</span>
                <span>{action.label}</span>
                <svg className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 text-lg text-center">
          {[
            { title: "Total Users", count: filteredUsers.length },
            { title: "Active Sessions", count: filteredSessions.length },
            { title: "Pending Bookings", count: pendingBookingsCount, color: "#F59E0B" },
            { title: "Resources", count: filteredResources.length },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-[#38BDF8] p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group hover:scale-105 flex flex-col items-center justify-center"
            >
              <div className="text-4xl font-bold text-black mb-2 transition-colors">
                {stat.count}
              </div>
              <p className="text-black font-medium">{stat.title}</p>
            
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          {/* Recent Sessions & Bookings */}
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-purple-300"></span>
                Recent Sessions & Bookings
              </h2>
              <button
                onClick={() => (window.location.href = "/sessions")}
                className="text-sm font-medium px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors"
                style={{ color: colors.primary }}
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              {/* Pending Bookings */}
              {pendingBookingsCount > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="text-blue-500">📅</span>
                    Pending Session Requests
                  </h3>
                  {pendingBookings.map((booking) => (
                    <div
                      key={`pending-${booking._id}`}
                      className="flex items-center justify-between p-4 rounded-xl border border-blue-200 bg-blue-50 hover:shadow-md transition-all duration-200 group cursor-pointer"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <span className="text-blue-600">⏰</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {booking.topic}
                          </h3>
                          <p className="text-sm text-gray-600">{booking.studentName}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(booking.preferredDate).toLocaleDateString()} at {booking.preferredTime}
                          </p>
                        </div>
                      </div>
                      <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 shadow-sm">
                        Action Required
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Regular Sessions */}
              {recentSessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg
                    className="w-12 h-12 mx-auto text-gray-300 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p>No recent sessions</p>
                </div>
              ) : (
                recentSessions.map((session) => (
                  <div
                    key={session._id}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${colors.primary}20` }}
                      >
                        <svg
                          className="w-5 h-5"
                          style={{ color: colors.primary }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {session.topic}
                        </h3>
                        <p className="text-sm text-gray-600">{session.userName}</p>
                      </div>
                    </div>
                    <div
                      className="px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm"
                      style={{ backgroundColor: colors.secondary }}
                    >
                      Active
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Feedback */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-purple-200"></span>
                Recent Feedback
              </h2>
              <button
                onClick={() => (window.location.href = "/feedback")}
                className="text-sm font-medium px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors"
                style={{ color: colors.primary }}
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              {recentFeedback.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg
                    className="w-12 h-12 mx-auto text-gray-300 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                  <p>No recent feedback</p>
                </div>
              ) : (
                recentFeedback.map((item) => (
                  <div
                    key={item._id}
                    className="p-4 rounded-xl border border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className="p-2 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: `${colors.ternary}50` }}
                      >
                        <svg
                          className="w-4 h-4"
                          style={{ color: colors.ternary }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700 text-sm line-clamp-2">
                          {item.comment}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">- {item.userName}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Booking Action Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-2xl w-full max-w-2xl relative shadow-2xl">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                onClick={() => setSelectedBooking(null)}
                disabled={isLoading}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="p-4 rounded-xl mb-6 -mt-6 -mx-6 text-white" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
                <h2 className="text-2xl font-bold">Session Booking Request</h2>
                <p className="opacity-90">From: {selectedBooking.studentName}</p>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><strong className="text-gray-700">Topic:</strong> {selectedBooking.topic}</p>
                    <p><strong className="text-gray-700">Student:</strong> {selectedBooking.studentName}</p>
                    <p><strong className="text-gray-700">Email:</strong> {selectedBooking.studentEmail}</p>
                  </div>
                  <div>
                    <p><strong className="text-gray-700">Preferred Date:</strong> {new Date(selectedBooking.preferredDate).toLocaleDateString()}</p>
                    <p><strong className="text-gray-700">Preferred Time:</strong> {selectedBooking.preferredTime}</p>
                    <p><strong className="text-gray-700">Urgency:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        selectedBooking.urgency === 'high' ? 'bg-red-100 text-red-800' :
                        selectedBooking.urgency === 'medium' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-400'
                      }`}>
                        {selectedBooking.urgency}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div>
                  <strong className="text-gray-700">Description:</strong>
                  <p className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    {selectedBooking.description || "No description provided."}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleBookingAction(selectedBooking._id, 'rejected', 'Not available at requested time')}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  Reject
                </button>
                <button
                  onClick={() => handleBookingAction(selectedBooking._id, 'confirmed')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    "Confirm Session"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Student & Response Modal */}
        {selectedStudent && selectedResponse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-2xl w-full max-w-2xl relative shadow-2xl">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                onClick={() => {
                  setSelectedStudent(null);
                  setSelectedResponse(null);
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="p-4 rounded-xl mb-6 -mt-6 -mx-6 text-white" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
                <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
                <p className="opacity-90">{selectedStudent.role}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <p><strong className="text-gray-700">Email:</strong> {selectedStudent.email}</p>
                  <p><strong className="text-gray-700">Phone:</strong> {selectedStudent.phone || "N/A"}</p>
                </div>
                <div className="p-4 rounded-xl border" style={{ backgroundColor: `${colors.ternary}20`, borderColor: colors.ternary }}>
                  <h3 className="font-semibold text-gray-800 mb-2">Assessment Response</h3>
                  <p className="text-sm text-gray-600">Submitted on {new Date(selectedResponse.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="font-semibold text-gray-800 mb-4 text-lg border-b pb-2">Assessment Answers</h3>
                <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
                  {selectedResponse.answers.map((a, i) => (
                    <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-[#6EE7B7] transition-colors">
                      <p className="font-medium text-gray-700 mb-2">{a.questionText}</p>
                      <p className="font-semibold bg-white py-2 px-3 rounded-lg border" style={{ color: colors.primary, borderColor: colors.primary }}>{a.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CounselorDashboard;