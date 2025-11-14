import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Student_sidebar from "../../Components/sidebar/Student_sidebar";

const StudentDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    topic: "",
    description: "",
    preferredDate: "",
    preferredTime: "",
    urgency: "medium",
  });
  const [counselors, setCounselors] = useState([]);
  const [selectedCounselor, setSelectedCounselor] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [analytics, setAnalytics] = useState({
    sessions: {},
    resources: {},
    wellness: {},
  });

  const baseURL = "http://localhost:5000/api";
  const user = JSON.parse(localStorage.getItem("user")) || null;

  // Enhanced resource categories with better data
  const resourceCategories = [
    { name: "Stress Management", color: "#3B82F2",  count: 12 },
    { name: "Anxiety Relief", color: "#8B5CF6",  count: 8 },
    { name: "Mindfulness", color: "#10B981",  count: 15 },
    { name: "Study Skills", color: "#F59E0B",  count: 10 },
    { name: "Relationships", color: "#EC4899", count: 6 },
    { name: "Self-Care", color: "#EF4444", count: 9 },
  ];

  // Fetch functions
  const fetchSessions = useCallback(() => {
    if (!user?._id) return Promise.resolve();
    return axios
      .get(`${baseURL}/bookings?studentId=${user._id}`)
      .then((res) => {
        if (res.data.success) {
          setSessions(res.data.bookings || []);
        } else {
          setSessions([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching sessions:", err);
        setSessions([]);
      });
  }, [user?._id, baseURL]);

  const fetchCounselors = useCallback(() => {
    return axios
      .get(`${baseURL}/users?role=counselor`)
      .then((res) => {
        let counselorsList = [];
        if (res.data.users && Array.isArray(res.data.users)) {
          counselorsList = res.data.users;
        } else if (res.data.success && Array.isArray(res.data.counselors)) {
          counselorsList = res.data.counselors;
        } else if (Array.isArray(res.data)) {
          counselorsList = res.data;
        }
        setCounselors(counselorsList);
      })
      .catch((err) => {
        console.error("Error fetching counselors:", err);
        setCounselors([]);
      });
  }, [baseURL]);

  const fetchAnalytics = async () => {
    if (!user?._id) return;
    try {
      const [sessionRes, resourceRes] = await Promise.all([
        axios.get(`${baseURL}/analytics/student/${user._id}/session-stats`),
        axios.get(`${baseURL}/analytics/student/${user._id}/resource-stats`),
      ]);

      setAnalytics({
        sessions: sessionRes.data?.data || {},
        resources: resourceRes.data?.data || {},
        wellness: {
          score: calculateWellnessScore(sessionRes.data?.data),
          mood: getMoodTrend(sessionRes.data?.data),
        },
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const calculateWellnessScore = (sessionData) => {
    const completed = sessionData?.completed || 0;
    const total = sessionData?.total || 1;
    return Math.min(Math.round((completed / total) * 100) + 30, 100);
  };

  const getMoodTrend = (sessionData) => {
    const completed = sessionData?.completed || 0;
    if (completed >= 5) return "Excellent";
    if (completed >= 3) return "Good";
    if (completed >= 1) return "Improving";
    return "Getting Started";
  };

  useEffect(() => {
    if (!user?._id) return;

    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchSessions(),
          fetchCounselors(),
          fetchAnalytics(),
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [user?._id, fetchSessions, fetchCounselors]);

  const handleBookSession = async (e) => {
    e.preventDefault();

    if (!selectedCounselor) {
      alert("Please select a counselor");
      return;
    }
    if (!bookingForm.topic.trim()) {
      alert("Please enter a topic");
      return;
    }

    setIsBooking(true);
    try {
      const bookingData = {
        studentId: user._id,
        studentName: user.name,
        counselorId: selectedCounselor,
        topic: bookingForm.topic,
        description: bookingForm.description,
        preferredDate: bookingForm.preferredDate,
        preferredTime: bookingForm.preferredTime,
        urgency: bookingForm.urgency,
      };

      const response = await axios.post(`${baseURL}/bookings`, bookingData);

      if (response.data.success) {
        setShowBookingModal(false);
        setBookingForm({
          topic: "",
          description: "",
          preferredDate: "",
          preferredTime: "",
          urgency: "medium",
        });
        setSelectedCounselor("");
        await fetchSessions();
        await fetchAnalytics();
        alert("Session booked successfully!");
      } else {
        alert(`Booking failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Booking failed. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  const handleBookingFormChange = (field, value) => {
    setBookingForm((prev) => ({ ...prev, [field]: value }));
  };

  // Chart Components
  const ProgressChart = ({ data, title, color = "#3B82F6" }) => {
    const total = data.total || 1;
    const completed = data.completed || 0;
    const pending = data.pending || 0;
    const cancelled = data.cancelled || 0;
    const percentage = Math.round((completed / total) * 100);

    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="16"
                cy="16"
                r="15.9155"
                fill="transparent"
                stroke="#E5E7EB"
                strokeWidth="8"
              />
              <circle
                cx="16"
                cy="16"
                r="15.9155"
                fill="transparent"
                stroke={color}
                strokeWidth="8"
                strokeDasharray={`${percentage} 100`}
                strokeDashoffset="0"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-2xl font-bold text-gray-800">
                {percentage}%
              </span>
              <span className="text-sm text-gray-500">
                {completed}/{total}
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-green-600 font-bold">{completed}</div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
          <div>
            <div className="text-yellow-600 font-bold">{pending}</div>
            <div className="text-xs text-gray-500">Pending</div>
          </div>
          <div>
            <div className="text-red-600 font-bold">{cancelled}</div>
            <div className="text-xs text-gray-500">Cancelled</div>
          </div>
        </div>
      </div>
    );
  };

  const ResourceCategoryChart = () => {
    const totalResources = resourceCategories.reduce(
      (sum, category) => sum + category.count,
      0
    );
    const maxCount = Math.max(...resourceCategories.map((item) => item.count));

    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            Resource Categories
          </h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {totalResources} total
          </span>
        </div>

   

        {/* Bar Chart */}
        <div className="space-y-3">
          {resourceCategories.map((category) => (
            <div key={category.name} className="flex items-center">
              <div className="flex items-center w-40">
                <span className="text-lg mr-2">{category.icon}</span>
                <span className="text-sm text-gray-600 truncate">
                  {category.name}
                </span>
              </div>
              <div className="flex-1 mx-3">
                <div className="flex items-center">
                  <div
                    className="h-4 rounded-full transition-all duration-500"
                    style={{
                      width: `${(category.count / maxCount) * 100}%`,
                      backgroundColor: category.color,
                    }}
                  ></div>
                  <span className="text-xs text-gray-500 ml-2 w-8">
                    {Math.round((category.count / maxCount) * 100)}%
                  </span>
                </div>
              </div>
              <span className="text-sm font-bold text-gray-700 w-8 text-right">
                {category.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const MonthlyEngagementChart = () => {
    const monthlyData = [
      { month: "Jan", sessions: 3, resources: 8, mood: 70 },
      { month: "Feb", sessions: 5, resources: 12, mood: 75 },
      { month: "Mar", sessions: 4, resources: 10, mood: 72 },
      { month: "Apr", sessions: 6, resources: 15, mood: 80 },
      { month: "May", sessions: 7, resources: 18, mood: 85 },
      { month: "Jun", sessions: 8, resources: 20, mood: 88 },
    ];

    const maxValue = Math.max(
      ...monthlyData.flatMap((d) => [d.sessions, d.resources])
    );

    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Monthly Progress
        </h3>
        <div className="flex items-end justify-between h-40 space-x-1 mb-6">
          {monthlyData.map((data) => (
            <div key={data.month} className="flex flex-col items-center flex-1">
              <div className="flex items-end space-x-1 w-full justify-center mb-2">
                <div
                  className="w-2 bg-blue-500 rounded-t transition-all duration-500"
                  style={{ height: `${(data.sessions / maxValue) * 80}px` }}
                  title={`${data.sessions} sessions`}
                ></div>
                <div
                  className="w-2 bg-green-500 rounded-t transition-all duration-500"
                  style={{ height: `${(data.resources / maxValue) * 80}px` }}
                  title={`${data.resources} resources`}
                ></div>
              </div>
              <div
                className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: `hsl(${data.mood}, 70%, 50%)` }}
                title={`Mood: ${data.mood}%`}
              ></div>
              <span className="text-xs text-gray-500 mt-2">{data.month}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-center space-x-6">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
            <span className="text-xs text-gray-600">Sessions</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span className="text-xs text-gray-600">Resources</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
            <span className="text-xs text-gray-600">Mood</span>
          </div>
        </div>
      </div>
    );
  };

  const WellnessCard = () => (
    <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold mb-1">Wellness Overview</h3>
          <p className="text-purple-100 text-sm">Your mental health journey</p>
        </div>
        <div className="text-2xl">
          {analytics.wellness.score >= 80
            ? "😊"
            : analytics.wellness.score >= 60
            ? "🙂"
            : "😌"}
        </div>
      </div>
      <div className="text-3xl font-bold mb-2">
        {analytics.wellness.score || 75}%
      </div>
      <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mb-4">
        <div
          className="bg-white h-2 rounded-full transition-all duration-1000"
          style={{ width: `${analytics.wellness.score || 75}%` }}
        ></div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
          {analytics.wellness.mood || "Good"}
        </span>
        <div className="text-xs text-purple-100">
          {analytics.sessions.completed || 0} sessions completed
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Student_sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Student Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.name || "Student"}! 
            </p>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search resources, sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-3 pl-10 w-72 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
            />
            <svg
              className="absolute left-3 top-3.5 h-4 w-4 text-gray-400"
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
          </div>
        </header>

        {/* Quick Actions */}
        <div className="p-8 rounded-2xl shadow-lg mb-8 bg-sky-300">
          <h2 className="text-3xl font-bold text-black mb-6">Quick Actions</h2>
          <div className="flex flex-wrap gap-4 text-lg">
            {[
              {
                label: "Book a Session",
                action: () => setShowBookingModal(true),
              },
              { label: "Browse Resources",  path: "/resources" },
              { label: "MindBot", path: "/mindbot" },
              { label: "Wellness Check",  path: "/questionnaire" },
            ].map((action, index) => (
              <button
                key={`action-${index}`}
                onClick={
                  action.action || (() => (window.location.href = action.path))
                }
                className="bg-white text-gray-800 px-6 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-3 group"
              >
                <span className="text-xl">{action.icon}</span>
                <span>{action.label}</span>
                <svg
                  className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-sky-300 rounded-2xl p-6 text-black shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black font-semibold">Total Sessions</p>
                <p className="text-2xl font-bold">
                  {analytics.sessions.total || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-sky-300 rounded-2xl p-6 text-black shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black font-semibold">Resources</p>
                <p className="text-2xl font-bold">
                  {analytics.resources.total || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-sky-300 rounded-2xl p-6 text-black shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black font-semibold">Completed</p>
                <p className="text-2xl font-bold">
                  {analytics.sessions.completed || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-sky-300 rounded-2xl p-6 text-black shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black font-semibold">Upcoming</p>
                <p className="text-2xl font-bold">
                  {analytics.sessions.pending || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

     
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ResourceCategoryChart />
          <MonthlyEngagementChart />
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Recent Sessions
            </h2>
            <button
              onClick={() => setShowBookingModal(true)}
              className="bg-sky-300 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors font-semibold"
            >
              + Book New Session
            </button>
          </div>

          {sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.slice(0, 4).map((session) => (
                <div
                  key={session._id}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        session.status === "confirmed"
                          ? "bg-green-500"
                          : session.status === "pending"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    ></div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {session.topic || "No topic"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {session.preferredDate
                          ? new Date(session.preferredDate).toLocaleDateString()
                          : "No date"}{" "}
                        • {session.preferredTime || "No time"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      session.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : session.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {session.status || "pending"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg mb-4">No sessions booked yet</p>
              <button
                onClick={() => setShowBookingModal(true)}
                className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors"
              >
                Book Your First Session
              </button>
            </div>
          )}
        </div>

        {/* Booking Modal */}
        {showBookingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Book a Session
                </h3>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isBooking}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleBookSession} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Counselor
                  </label>
                  <select
                    value={selectedCounselor}
                    onChange={(e) => setSelectedCounselor(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    required
                    disabled={isBooking}
                  >
                    <option value="">Select a counselor</option>
                    {counselors.map((counselor) => (
                      <option key={counselor._id} value={counselor._id}>
                        {counselor.name} -{" "}
                        {counselor.specialization || "General Counseling"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Topic
                  </label>
                  <input
                    type="text"
                    value={bookingForm.topic}
                    onChange={(e) =>
                      handleBookingFormChange("topic", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="What would you like to discuss?"
                    required
                    disabled={isBooking}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={bookingForm.description}
                    onChange={(e) =>
                      handleBookingFormChange("description", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    rows="3"
                    placeholder="Please provide some details..."
                    required
                    disabled={isBooking}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      value={bookingForm.preferredDate}
                      onChange={(e) =>
                        handleBookingFormChange("preferredDate", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      required
                      disabled={isBooking}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Time
                    </label>
                    <input
                      type="time"
                      value={bookingForm.preferredTime}
                      onChange={(e) =>
                        handleBookingFormChange("preferredTime", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      required
                      disabled={isBooking}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urgency Level
                  </label>
                  <select
                    value={bookingForm.urgency}
                    onChange={(e) =>
                      handleBookingFormChange("urgency", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    disabled={isBooking}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 px-4 hover:bg-gray-50 transition-colors"
                    disabled={isBooking}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 text-white rounded-lg py-2 px-4 hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                    disabled={isBooking}
                  >
                    {isBooking ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Booking...
                      </>
                    ) : (
                      "Book Session"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
