import React, { useEffect, useState, useCallback } from "react";
import API from "../../api/api"; // Axios instance with JWT
import Sidebar from "../../Components/sidebar/Sidebar";

const CounselorDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [resources, setResources] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user")); // logged-in counselor

  // Elegant color palette
  const colors = {
    primary: "#6366F1",
    secondary: "#8B5CF6",
    accent: "#06B6D4",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    background: "#F8FAFC",
    surface: "#FFFFFF",
    text: {
      primary: "#1E293B",
      secondary: "#64748B",
      muted: "#94A3B8",
    },
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
        cancellationReason: reason,
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
      alert(
        `Failed to ${action} booking: ${
          err.response?.data?.message || err.message
        }`
      );
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
          fetchNotifications(),
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [
    fetchUsers,
    fetchSessions,
    fetchBookings,
    fetchResources,
    fetchNotifications,
  ]);

  // ------------------------
  // FILTER FUNCTION
  // ------------------------
  const filterData = (data, fields) => {
    if (!searchQuery.trim()) return data;
    return data.filter((item) =>
      fields.some((field) =>
        item[field]
          ?.toString()
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    );
  };

  const filteredUsers = filterData(users, ["name", "email", "role"]);
  const filteredSessions = filterData(sessions, ["userName", "topic"]);
  const filteredBookings = filterData(bookings, [
    "studentName",
    "topic",
    "status",
  ]);
  const filteredResources = filterData(resources, [
    "title",
    "description",
    "category",
  ]);

  const handleSearch = (e) => e.preventDefault();

  // Get recent items for overview
  const recentSessions = filteredSessions.slice(0, 3);
  const pendingBookings = filteredBookings
    .filter((b) => b.status === "pending")
    .slice(0, 5);

  // Count notifications for badge
  const pendingBookingsCount = bookings.filter(
    (b) => b.status === "pending"
  ).length;
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;
  const totalNotificationCount =
    unreadNotificationsCount + pendingBookingsCount;

  // Separate notifications by type
  const questionnaireNotifications = notifications.filter(
    (n) =>
      n.type === "questionnaire" ||
      n.responseId ||
      n.message?.toLowerCase().includes("assessment") ||
      n.message?.toLowerCase().includes("questionnaire")
  );

  const bookingNotifications = notifications.filter(
    (n) =>
      n.type === "booking" ||
      n.message?.toLowerCase().includes("booking") ||
      n.message?.toLowerCase().includes("session")
  );

  const otherNotifications = notifications.filter(
    (n) =>
      !questionnaireNotifications.includes(n) &&
      !bookingNotifications.includes(n)
  );

  const unreadQuestionnaireCount = questionnaireNotifications.filter(
    (n) => !n.read
  ).length;
  const unreadBookingCount = bookingNotifications.filter((n) => !n.read).length;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">
                Loading dashboard...
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Counselor Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back,{" "}
              <span className="font-semibold text-indigo-600">
                {user?.name || "Counselor"}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search users, sessions, resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-3 pl-12 w-96 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
              />
              <svg
                className="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </form>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="relative p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-indigo-300 group"
              >
                <svg
                  className="w-8 h-8 text-black group-hover:text-indigo-600 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>

                {totalNotificationCount > 0 && (
                  <span className="absolute top-2 right-2 inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                )}
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-96 max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                  <div className="p-4 border-b border-gray-100 bg-sky-400 rounded-t-xl">
                    <h3 className="font-semibold text-white text-lg">
                      Notifications
                    </h3>
                    <p className="text-indigo-100 text-sm mt-1">
                      {pendingBookingsCount > 0 &&
                        `${pendingBookingsCount} pending booking(s)`}
                      {pendingBookingsCount > 0 &&
                        unreadNotificationsCount > 0 &&
                        " • "}
                      {unreadNotificationsCount > 0 &&
                        `${unreadNotificationsCount} unread message(s)`}
                    </p>
                  </div>

                  {/* Pending Bookings Section */}
                  {pendingBookingsCount > 0 && (
                    <div className="border-b border-gray-100">
                      <div className="p-3 bg-blue-50 border-l-4 border-blue-500">
                        <p className="text-sm font-semibold text-blue-900 flex items-center gap-2">
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
                                Preferred:{" "}
                                {new Date(
                                  booking.preferredDate
                                ).toLocaleDateString()}{" "}
                                at {booking.preferredTime}
                              </p>
                              <p className="text-xs text-gray-500">
                                Urgency:
                                <span
                                  className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                                    booking.urgency === "high"
                                      ? "bg-red-100 text-red-800"
                                      : booking.urgency === "medium"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {booking.urgency}
                                </span>
                              </p>
                            </div>
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
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
                      <div className="p-3 bg-purple-50 border-l-4 border-purple-500">
                        <p className="text-sm font-semibold text-purple-900 flex items-center gap-2">
                          <span>📝</span>
                          Questionnaire Responses ({
                            unreadQuestionnaireCount
                          }{" "}
                          unread)
                        </p>
                      </div>
                      {questionnaireNotifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => {
                            markAsRead(n._id);
                            if (n.responseId)
                              fetchResponseDetails(n.responseId);
                          }}
                          className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-purple-50 group ${
                            n.read
                              ? "bg-white"
                              : "bg-purple-50 border-l-4 border-purple-500"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p
                                className={`${
                                  n.read
                                    ? "text-gray-600"
                                    : "text-gray-800 font-semibold"
                                } group-hover:text-purple-600 transition-colors`}
                              >
                                {n.message}
                              </p>
                              <span className="text-xs text-gray-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {!n.read && (
                              <span className="ml-2 text-purple-500 animate-pulse flex-shrink-0">
                                ●
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Booking Notifications Section */}
                  {bookingNotifications.length > 0 && (
                    <div className="border-b border-gray-100">
                      <div className="p-3 bg-blue-50 border-l-4 border-blue-500">
                        <p className="text-base font-semibold text-blue-900 flex items-center gap-2">
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
                          style={{
                            borderLeftColor: n.read
                              ? "transparent"
                              : colors.secondary,
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p
                                className={`${
                                  n.read
                                    ? "text-gray-600"
                                    : "text-gray-800 font-semibold"
                                } group-hover:text-blue-600 transition-colors`}
                              >
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
                              >
                                ●
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Other Notifications Section */}
                  {otherNotifications.length > 0 && (
                    <div>
                      <div className="p-3 bg-gray-50 border-l-4 border-gray-500">
                        <p className="text-base font-semibold text-gray-900 flex items-center gap-2">
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
                          style={{
                            borderLeftColor: n.read ? "transparent" : "#6B7280",
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p
                                className={`${
                                  n.read
                                    ? "text-gray-600"
                                    : "text-gray-800 font-semibold"
                                } group-hover:text-gray-600 transition-colors`}
                              >
                                {n.message}
                              </p>
                              <span className="text-xs text-gray-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {!n.read && (
                              <span className="ml-2 font-bold animate-pulse flex-shrink-0 text-gray-500">
                                ●
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Empty State */}
                  {notifications.length === 0 && pendingBookingsCount === 0 && (
                    <div className="px-4 py-8 text-gray-500 text-center">
                      <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <p className="font-medium">No notifications</p>
                      <p className="text-sm mt-1">You're all caught up!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-2 space-y-8">
            {/* Welcome Card */}
            <div className="bg-sky-300 rounded-2xl p-8 text-black shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    Hi, {user?.name?.split(" ")[0] || "Counselor"}!
                  </h2>
                  <p className=" opacity-90">
                    You have {pendingBookingsCount} pending sessions and{" "}
                    {unreadNotificationsCount} unread messages today.
                  </p>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            {/* Quick Actions */}
            <div className="bg-sky-300 rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    label: "Manage Sessions",
                    path: "/sessions",
                    color: "blue",
                  },
                  {
                    label: "Manage Users",
                    path: "/users",
                    color: "blue",
                  },
                  {
                    label: "Manage Resources",
                    path: "/resources",
                    color: "blue",
                  },
                ].map((action, index) => (
                  <button
                    key={index}
                    onClick={() => (window.location.href = action.path)}
                    className={`p-4 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-md border-2 border-transparent hover:border-${action.color}-200 bg-gradient-to-br from-white to-gray-50 group flex`}
                  >
                    {/* Icon */}
                    <span className="text-xl pr-3">{action.icon}</span>

                    {/* Text */}
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {action.label}
                    </h3>
                  </button>
                ))}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: "Total Users",
                  count: filteredUsers.length,
                  color: "blue",
                  trend: "+12%",
                },
                {
                  title: "Active Sessions",
                  count: filteredSessions.length,
                  color: "blue",
                  trend: "+5%",
                },
                {
                  title: "Pending Bookings",
                  count: pendingBookingsCount,
                  color: "blue",
                  trend: "Action needed",
                },
                {
                  title: "Resources",
                  count: filteredResources.length,
                  color: "blue",
                  trend: "+8%",
                },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-sky-200 rounded-2xl p-4 shadow-sm border-2 border-sky-400 h"
                >
                  <div className="flex justify-between items-start mb-4">
                  
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        stat.color === "blue"
                          ? "bg-blue-100 text-blue-800"
                          : stat.color === "green"
                          ? "bg-green-100 text-green-800"
                          : stat.color === "orange"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {stat.trend}
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.count}
                  </div>
                  <p className="text-black text-lg font-medium">{stat.title}</p>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
           

              <div className="space-y-4">
                {/* Pending Bookings */}
                {pendingBookingsCount > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      Pending Session Requests
                    </h3>
                    <div className="space-y-3">
                      {pendingBookings.map((booking) => (
                        <div
                          key={`pending-${booking._id}`}
                          className="flex items-center justify-between p-4 rounded-xl border border-blue-200 bg-sky-50 hover:shadow-md transition-all duration-200 cursor-pointer group"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600">⏰</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800 ">
                                {booking.topic}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {booking.studentName} •{" "}
                                {new Date(
                                  booking.preferredDate
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Review
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Sessions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Recent Sessions
                  </h3>
                  {recentSessions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-gray-400"
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
                      <p>No recent sessions</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentSessions.map((session) => (
                        <div
                          key={session._id}
                          className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-all duration-200 group"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-blue-600"
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
                              <p className="text-sm text-gray-600">
                                {session.userName}
                              </p>
                            </div>
                          </div>
                          <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Completed
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Upcoming Schedule */}
            <div className="bg-sky-300 rounded-2xl p-6 text-black">
              <h2 className="text-xl font-bold mb-4">Upcoming Schedule</h2>
              <div className="space-y-3">
                {bookings
                  .filter((b) => b.status === "confirmed")
                  .slice(0, 3)
                  .map((booking, index) => (
                    <div
                      key={index}
                      className="bg-white bg-opacity-20 p-4 rounded-xl"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{booking.topic}</h3>
                        <span className="text-xs bg-white bg-opacity-40 px-2 py-1 rounded-full">
                          {booking.preferredTime}
                        </span>
                      </div>
                      <p className="text-black text-sm">
                        {booking.studentName}
                      </p>
                      <p className="text-black text-sm mt-1">
                        {new Date(booking.preferredDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                {bookings.filter((b) => b.status === "confirmed").length ===
                  0 && (
                  <div className="text-center py-4 text-indigo-200">
                    <p>No upcoming sessions</p>
                  </div>
                )}
              </div>
            </div>
        

            {/* Recent Users */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Recent Users
                </h2>
                <button
                  onClick={() => (window.location.href = "/users")}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {filteredUsers.slice(0, 5).map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {user.name}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {user.role}
                        </p>
                      </div>
                    </div>
                    <div className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Active
                    </div>
                  </div>
                ))}
                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    </div>
                    <p>No users found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Booking Action Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-2xl w-full max-w-2xl relative shadow-2xl">
              <button
                className="absolute top-4 right-4 text-white hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                onClick={() => setSelectedBooking(null)}
                disabled={isLoading}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="p-6 mb-6 -mt-6 -mx-6 text-white bg-sky-400 rounded-t-2xl">
                <h2 className="text-xl font-bold">Session Booking Request</h2>
                <p className="opacity-90">
                  From: {selectedBooking.studentName}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p>
                      <strong className="text-gray-700">Topic:</strong>{" "}
                      {selectedBooking.topic}
                    </p>
                    <p>
                      <strong className="text-gray-700">Student:</strong>{" "}
                      {selectedBooking.studentName}
                    </p>
                    <p>
                      <strong className="text-gray-700">Email:</strong>{" "}
                      {selectedBooking.studentEmail}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong className="text-gray-700">Preferred Date:</strong>{" "}
                      {new Date(
                        selectedBooking.preferredDate
                      ).toLocaleDateString()}
                    </p>
                    <p>
                      <strong className="text-gray-700">Preferred Time:</strong>{" "}
                      {selectedBooking.preferredTime}
                    </p>
                    <p>
                      <strong className="text-gray-700">Urgency:</strong>
                      <span
                        className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                          selectedBooking.urgency === "high"
                            ? "bg-red-100 text-red-800"
                            : selectedBooking.urgency === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
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
                  onClick={() =>
                    handleBookingAction(
                      selectedBooking._id,
                      "rejected",
                      "Not available at requested time"
                    )
                  }
                  className="px-6 py-3 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50 font-medium"
                  disabled={isLoading}
                >
                  Reject
                </button>
                <button
                  onClick={() =>
                    handleBookingAction(selectedBooking._id, "confirmed")
                  }
                  className="px-6 py-3 bg-sky-400 text-white rounded-xl  disabled:opacity-50 flex items-center gap-2 font-medium"
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
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="p-4 rounded-xl mb-6 -mt-6 -mx-6 text-white bg-gradient-to-r from-indigo-600 to-purple-600">
                <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
                <p className="opacity-90">{selectedStudent.role}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <p>
                    <strong className="text-gray-700">Email:</strong>{" "}
                    {selectedStudent.email}
                  </p>
                  <p>
                    <strong className="text-gray-700">Phone:</strong>{" "}
                    {selectedStudent.phone || "N/A"}
                  </p>
                </div>
                <div className="p-4 rounded-xl border bg-purple-50 border-purple-200">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Assessment Response
                  </h3>
                  <p className="text-sm text-gray-600">
                    Submitted on{" "}
                    {new Date(selectedResponse.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold text-gray-800 mb-4 text-lg border-b pb-2">
                  Assessment Answers
                </h3>
                <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
                  {selectedResponse.answers.map((a, i) => (
                    <div
                      key={i}
                      className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-indigo-300 transition-colors"
                    >
                      <p className="font-medium text-gray-700 mb-2">
                        {a.questionText}
                      </p>
                      <p className="font-semibold bg-white py-2 px-3 rounded-lg border border-indigo-200 text-indigo-700">
                        {a.answer}
                      </p>
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
