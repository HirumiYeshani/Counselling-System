import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Student_sidebar from "../../Components/sidebar/Student_sidebar";

const StudentDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [resources, setResources] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    topic: "",
    description: "",
    preferredDate: "",
    preferredTime: "",
    urgency: "medium"
  });
  const [counselors, setCounselors] = useState([]);
  const [selectedCounselor, setSelectedCounselor] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const baseURL = "http://localhost:5000/api";
  const user = JSON.parse(localStorage.getItem("user")) || null;

  const colors = {
    primary: "#C4B5FD",
    secondary: "#38BDF8",
  };

  // Memoized fetch functions to prevent unnecessary re-renders
  const fetchSessions = useCallback(() => {
    return axios
      .get(`${baseURL}/bookings?studentId=${user._id}`)
      .then((res) => {
        if (res.data.success) {
          setSessions(res.data.bookings || []);
        } else {
          console.error("Failed to fetch sessions:", res.data.message);
          setSessions([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching sessions:", err);
        setSessions([]);
      });
  }, [user?._id]);

  const fetchResources = useCallback(() => {
    return axios
      .get(`${baseURL}/resources`)
      .then((res) => {
        // Handle different response structures
        if (res.data.resources) {
          setResources(res.data.resources);
        } else if (Array.isArray(res.data)) {
          setResources(res.data);
        } else {
          setResources([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching resources:", err);
        setResources([]);
      });
  }, []);

  const fetchFeedback = useCallback(() => {
    return axios
      .get(`${baseURL}/feedback?userId=${user._id}`)
      .then((res) => {
        if (res.data.feedback) {
          setFeedback(res.data.feedback);
        } else if (Array.isArray(res.data)) {
          setFeedback(res.data);
        } else {
          setFeedback([]);
        }
      })
      .catch(() => {
        console.log("Feedback not available, using empty data");
        setFeedback([]);
      });
  }, [user?._id]);

  const fetchCounselors = useCallback(() => {
    return axios
      .get(`${baseURL}/users?role=counselor`)
      .then((res) => {
        console.log("Counselors API response:", res.data);
        
        let counselorsList = [];
        
        if (res.data.users && Array.isArray(res.data.users)) {
          counselorsList = res.data.users;
        } else if (res.data.success && Array.isArray(res.data.counselors)) {
          counselorsList = res.data.counselors;
        } else if (Array.isArray(res.data)) {
          counselorsList = res.data;
        } else if (res.data.success && Array.isArray(res.data.data)) {
          counselorsList = res.data.data;
        }
        
        setCounselors(counselorsList);
        console.log(`Loaded ${counselorsList.length} counselors`);
      })
      .catch((err) => {
        console.error("Error fetching counselors:", err);
        setCounselors([]);
      });
  }, []);

  useEffect(() => {
    if (!user?._id) return;

    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchSessions(),
          fetchResources(),
          fetchFeedback(),
          fetchCounselors()
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [user?._id, fetchSessions, fetchResources, fetchFeedback, fetchCounselors]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Search functionality - no state updates that cause re-renders
  };

  const handleBookSession = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!selectedCounselor) {
      alert("Please select a counselor");
      return;
    }
    if (!bookingForm.topic.trim()) {
      alert("Please enter a topic");
      return;
    }
    if (!bookingForm.preferredDate) {
      alert("Please select a date");
      return;
    }
    if (!bookingForm.preferredTime) {
      alert("Please select a time");
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
        urgency: bookingForm.urgency
      };

      console.log("Sending booking request...", bookingData);
      
      const response = await axios.post(`${baseURL}/bookings`, bookingData);
      
      console.log("Booking response:", response.data);
      
      if (response.data.success) {
        // Success - reset form and close modal
        setShowBookingModal(false);
        setBookingForm({
          topic: "",
          description: "",
          preferredDate: "",
          preferredTime: "",
          urgency: "medium"
        });
        setSelectedCounselor("");
        
        // Refresh sessions list
        await fetchSessions();
        
        alert("Session booked successfully! The counselor will be notified.");
      } else {
        alert(`Booking failed: ${response.data.message}`);
      }
      
    } catch (error) {
      console.error("Booking error:", error);
      
      if (error.response) {
        const errorMessage = error.response.data?.message || error.response.data?.error || 'Booking failed';
        alert(`Error: ${errorMessage}`);
      } else if (error.request) {
        alert('Network error: Please check your connection and try again.');
      } else {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setIsBooking(false);
    }
  };

  const filterData = (data, fields) => {
    if (!searchQuery.trim()) return data;
    return data.filter((item) =>
      fields.some((field) =>
        item[field]?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  };

  const filteredResources = filterData(resources, ["title", "description", "category"]);

  const handleCounselorChange = (e) => {
    setSelectedCounselor(e.target.value);
  };

  const handleBookingFormChange = (field, value) => {
    setBookingForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: "#f8fafc" }}>
      <Student_sidebar />

      <div className="flex-1 p-8 overflow-y-auto">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Student Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.name || "Student"}</p>
          </div>

          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 pl-10 w-72 focus:outline-none focus:ring-2 focus:ring-[#6EE7B7] focus:border-transparent bg-white shadow-sm"
              style={{ borderColor: colors.primary }}
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
          </form>
        </header>

        {/* Quick Actions */}
        <div
          className="p-8 rounded-2xl shadow-lg mb-8"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
          }}
        >
          <h2 className="text-3xl font-bold text-black mb-6">Quick Actions</h2>
          <div className="flex flex-wrap gap-4 text-lg">
            {[
              { label: "Book a Session", icon: "📅", action: () => setShowBookingModal(true) },
              { label: "Give Feedback", icon: "💬", path: "/feedback" },
              { label: "Browse Resources", icon: "📚", path: "/resources" },
            ].map((action, index) => (
              <button
                key={`action-${index}`}
                onClick={action.action || (() => (window.location.href = action.path))}
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 text-lg text-center">
          {[
            { title: "My Sessions", count: sessions.length },
            { title: "Resources", count: resources.length },
            { title: "My Feedback", count: feedback.length },
          ].map((stat, index) => (
            <div
              key={`stat-${index}`}
              className="bg-[#38BDF8] p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group hover:scale-105 flex flex-col items-center justify-center"
            >
              <div className="text-4xl font-bold text-black mb-2">{stat.count}</div>
              <p className="text-black font-medium">{stat.title}</p>
             
            </div>
          ))}
        </div>

        {/* My Sessions + Resources - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Sessions */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                My Upcoming Sessions
              </h2>
            </div>
            
            {sessions.length > 0 ? (
              <div className="space-y-4">
                {sessions.map((session) => {
                  const sessionDate = session.preferredDate ? new Date(session.preferredDate) : new Date();
                  const counselorName = session.counselorName || session.counselorId?.name || 'Counselor';
                  
                  return (
                    <div
                      key={`session-${session._id}`}
                      className="flex justify-between items-center p-4 rounded-xl border border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1">{session.topic || 'No topic'}</h3>
                        <p className="text-sm text-gray-600 mb-1">
                          {sessionDate.toLocaleDateString()} • {session.preferredTime || 'Time not set'}
                        </p>
                        <p className="text-xs text-gray-500 mb-1">
                          Counselor: <span className="font-medium text-blue-600">{counselorName}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          Status: <span className={`font-medium ${
                            session.status === 'confirmed' ? 'text-green-600' : 
                            session.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {session.status || 'pending'}
                          </span>
                        </p>
                      </div>
                      <div
                        className="px-3 py-1 rounded-full text-xs font-medium text-white shadow-sm whitespace-nowrap ml-4"
                        style={{ 
                          backgroundColor: 
                            session.status === 'confirmed' ? '#10B981' : 
                            session.status === 'pending' ? '#F59E0B' : '#EF4444'
                        }}
                      >
                        {session.status || 'pending'}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No upcoming sessions</p>
                <button 
                  onClick={() => setShowBookingModal(true)}
                  className="mt-4 px-4 py-2 bg-sky-400 text-white rounded-lg hover:bg-sky-500 transition-colors"
                >
                  Book Your First Session
                </button>
              </div>
            )}
          </div>

          {/* Resources */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                Available Resources
              </h2>
            </div>
            {filteredResources.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredResources.map((res) => (
                  <div
                    key={`resource-${res._id}`}
                    className="p-4 rounded-xl border border-gray-100 bg-gradient-to-r from-sky-50 to-purple-50 hover:shadow-md transition-all duration-200"
                  >
                    <h3 className="font-semibold text-gray-800 mb-2">{res.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {res.description || "No description available."}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">{res.category}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-6">No resources available</p>
            )}
          </div>
        </div>

        {/* Booking Modal */}
        {showBookingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Book a Session</h3>
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
                    onChange={handleCounselorChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    required
                    disabled={isBooking}
                  >
                    <option value="">Select a counselor</option>
                    {counselors.map((counselor) => (
                      <option key={`counselor-option-${counselor._id}`} value={counselor._id}>
                        {counselor.name} - {counselor.specialization || 'General Counseling'}
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
                    onChange={(e) => handleBookingFormChange('topic', e.target.value)}
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
                    onChange={(e) => handleBookingFormChange('description', e.target.value)}
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
                      onChange={(e) => handleBookingFormChange('preferredDate', e.target.value)}
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
                      onChange={(e) => handleBookingFormChange('preferredTime', e.target.value)}
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
                    onChange={(e) => handleBookingFormChange('urgency', e.target.value)}
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
                    className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 px-4 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    disabled={isBooking}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-sky-400 text-white rounded-lg py-2 px-4 hover:bg-sky-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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