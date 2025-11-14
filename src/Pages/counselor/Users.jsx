import React, { useEffect, useState } from "react";
import API from "../../api/api";
import Sidebar from "../../Components/sidebar/Sidebar";

const Users = ({ onUpdateCounts }) => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
    password: "",
    phone: "",
  });

  // Elegant blue color palette
  const colors = {
    primary: "#7DD3FC",
    secondary: "#38BDF8", 
    accent: "#0EA5E9",
    dark: "#0284C7",
    light: "#F0F9FF",
    background: "#FFFFFF"
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/users");
      setUsers(res.data);
      onUpdateCounts && onUpdateCounts("users", res.data.length);
    } catch (err) {
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await API.post("/users", {
        ...formData,
        role: formData.role.toLowerCase(),
      });
      setFormData({ name: "", email: "", role: "user", password: "", phone: "" });
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await API.delete(`/users/${id}`);
        fetchUsers();
      } catch (err) {
        console.error(err.response?.data || err.message);
      }
    }
  };

  const filteredUsers = filter === "All" 
    ? users 
    : users.filter((u) => u.role.toLowerCase() === filter.toLowerCase());

  const getRoleBadgeColor = (role) => {
    return role === "counselor" 
      ? { bg: "bg-blue-100", text: "text-blue-800", dot: "bg-blue-500" }
      : { bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-500" };
  };

  if (loading) {
    return (
      <div className="flex min-h-screen" style={{ backgroundColor: colors.light }}>
        <Sidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: colors.light }}>
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header Section */}
        <div className="flex-shrink-0 p-8 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-2xl text-white" style={{ backgroundColor: colors.primary }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
              <p className="text-gray-600 mt-1">Manage students and counselors in the system</p>
            </div>
          </div>
        </div>

        {/* Stats and Actions */}
        <div className="flex-shrink-0 px-8 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowForm(true)}
                    className="text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2 group"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add New User
                  </button>

                  <div className="relative">
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="appearance-none border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                      style={{ focusRingColor: colors.primary }}
                    >
                      <option value="All">All Users</option>
                      <option value="user">Students</option>
                      <option value="counselor">Counselors</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400">{users.length}</div>
                    <div className="text-gray-600 text-lg">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{users.filter(u => u.role?.toLowerCase() === 'counselor').length}</div>
                    <div className="text-gray-600 text-lg">Counselors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">  {users.filter(u => u.role?.toLowerCase() === 'student').length}</div>
                    <div className="text-gray-600 text-lg">Students</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-sky-400 rounded-2xl shadow-lg p-6 text-white">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">{filteredUsers.length}</div>
                <div className="text-white text-lg">Currently Showing</div>
                <div className="text-lg text-white mt-2">{filter === 'All' ? 'All Users' : filter + 's'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Users Grid - Scrollable Area */}
        <div className="flex-1 min-h-0 px-8 pb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex-shrink-0 p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5" style={{ color: colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                User Directory
              </h2>
            </div>

            <div className="flex-1 min-h-0 overflow-auto">
              {filteredUsers.length === 0 ? (
                <div className="flex items-center justify-center h-full py-12">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.primary}20` }}>
                      <svg className="w-10 h-10" style={{ color: colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Users Found</h3>
                    <p className="text-gray-600 mb-6">No users match your current filter criteria</p>
                    <button
                      onClick={() => setShowForm(true)}
                      className="text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200"
                      style={{ backgroundColor: colors.primary }}
                    >
                      Add Your First User
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6 auto-rows-max">
                  {filteredUsers.map((user) => {
                    const roleColors = getRoleBadgeColor(user.role);
                    return (
                      <div
                        key={user._id}
                        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group hover:border-blue-200 h-fit"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform shadow-lg"
                              style={{ backgroundColor: colors.primary }}
                            >
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800 text-lg group-hover:text-gray-900 transition-colors">
                                {user.name}
                              </h3>
                              <p className="text-gray-600 text-sm mt-1">{user.email}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${roleColors.bg} ${roleColors.text}`}>
                            <span className={`w-2 h-2 rounded-full mr-2 ${roleColors.dot}`}></span>
                            {user.role || "user"}
                          </div>

                          {user.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {user.phone}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="flex-1 bg-sky-400 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-600 transition-all duration-200 flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add User Modal */}
        {showForm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-95 hover:scale-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl text-white" style={{ backgroundColor: colors.primary }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Add New User</h2>
                </div>
              </div>
              
              <form onSubmit={handleAddUser} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                    style={{ focusRingColor: colors.primary }}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                    style={{ focusRingColor: colors.primary }}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                      style={{ focusRingColor: colors.primary }}
                    >
                      <option value="user">Student</option>
                      <option value="counselor">Counselor</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input
                      type="password"
                      placeholder="••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                      style={{ focusRingColor: colors.primary }}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone (Optional)</label>
                  <input
                    type="text"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                    style={{ focusRingColor: colors.primary }}
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 shadow-lg"
                    style={{ backgroundColor: colors.primary }}
                  >
                    Add User
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

export default Users;