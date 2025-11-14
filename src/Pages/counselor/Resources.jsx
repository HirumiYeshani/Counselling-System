import React, { useEffect, useState } from "react";
import API from "../../api/api";
import Sidebar from "../../Components/sidebar/Sidebar";

const Resources = ({ onUpdateCounts }) => {
  const [resources, setResources] = useState([]);
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
    category: "Good",
    file: null,
  });

  // Elegant blue color palette
  const colors = {
    primary: "#7DD3FC",
    secondary: "#38BDF8",
    accent: "#0EA5E9",
    dark: "#0284C7",
    light: "#F0F9FF",
    background: "#FFFFFF",
  };

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await API.get("/resources");
      setResources(res.data);
      onUpdateCounts && onUpdateCounts("resources", res.data.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleAddResource = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("category", formData.category);
      if (formData.file) data.append("file", formData.file);
      if (formData.link) data.append("link", formData.link);

      await API.post("/resources", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFormData({
        title: "",
        description: "",
        link: "",
        category: "Good",
        file: null,
      });
      setShowForm(false);
      fetchResources();
    } catch (err) {
      console.error("Error adding resource:", err);
    }
  };

  const handleDeleteResource = async (id) => {
    if (window.confirm("Are you sure you want to delete this resource?")) {
      try {
        await API.delete(`/resources/${id}`);
        fetchResources();
      } catch (err) {
        console.error(err);
      }
    }
  };
  // Add these helper functions inside your Resources component, before the return statement

  const getFileUrl = (filePath) => {
    if (!filePath) return "";

    if (filePath.startsWith("http")) {
      return filePath;
    }

    // Temporary hardcoded solution for testing
    return `http://localhost:5000${filePath}`;
  };
  const getButtonText = (filePath) => {
    if (filePath.startsWith("http")) return "Visit Link";

    const extension = filePath.split(".").pop()?.toLowerCase();
    const fileTypes = {
      pdf: "Open PDF",
      doc: "Open Document",
      docx: "Open Document",
      ppt: "Open Presentation",
      pptx: "Open Presentation",
    };

    return fileTypes[extension] || "Open File";
  };

  const filteredResources =
    filter === "All"
      ? resources
      : resources.filter((r) => r.category === filter);

  const getCategoryColor = (category) => {
    return category === "Good"
      ? {
          bg: "bg-emerald-100",
          text: "text-emerald-800",
          dot: "bg-emerald-500",
        }
      : { bg: "bg-amber-100", text: "text-amber-800", dot: "bg-amber-500" };
  };

  if (loading) {
    return (
      <div className="flex h-screen" style={{ backgroundColor: colors.light }}>
        <Sidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading resources...</p>
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
            <div
              className="p-3 rounded-2xl text-white"
              style={{ backgroundColor: colors.primary }}
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Resource Library
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and organize educational resources
              </p>
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
                    <svg
                      className="w-5 h-5 group-hover:scale-110 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add New Resource
                  </button>

                  <div className="relative">
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="appearance-none border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
                      style={{ focusRingColor: colors.primary }}
                    >
                      <option value="All">All Resources</option>
                      <option value="Good">Good Quality</option>
                      <option value="Low">Low Priority</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400">
                      {resources.length}
                    </div>
                    <div className="text-black">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {resources.filter((r) => r.category === "Good").length}
                    </div>
                    <div className="text-black">Good</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">
                      {resources.filter((r) => r.category === "Low").length}
                    </div>
                    <div className="text-gray-600">Low</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-sky-400 rounded-2xl shadow-lg p-6 text-white">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">
                  {filteredResources.length}
                </div>
                <div className="text-white text-lg">Currently Showing</div>
                <div className="text-lg text-white mt-2">
                  {filter === "All"
                    ? "All Resources"
                    : filter === "Good"
                    ? "Good Quality"
                    : "Low Priority"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resources Grid - Scrollable Area */}
        <div className="flex-1 min-h-0 px-8 pb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex-shrink-0 p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Resource Directory
              </h2>
            </div>

            <div className="flex-1 min-h-0 overflow-auto">
              {filteredResources.length === 0 ? (
                <div className="flex items-center justify-center h-full py-12">
                  <div className="text-center">
                    <div
                      className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${colors.primary}20` }}
                    >
                      <svg
                        className="w-10 h-10"
                        style={{ color: colors.primary }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      No Resources Found
                    </h3>
                    <p className="text-gray-600 mb-6">
                      No resources match your current filter criteria
                    </p>
                    <button
                      onClick={() => setShowForm(true)}
                      className="text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200"
                      style={{ backgroundColor: colors.primary }}
                    >
                      Add Your First Resource
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6 auto-rows-max">
                  {filteredResources.map((resource) => {
                    const categoryColors = getCategoryColor(resource.category);
                    return (
                      <div
                        key={resource._id}
                        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 group hover:border-blue-200 h-fit"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform shadow-lg"
                              style={{ backgroundColor: colors.primary }}
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
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 text-lg group-hover:text-gray-900 transition-colors line-clamp-2">
                                {resource.title}
                              </h3>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteResource(resource._id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 flex-shrink-0"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {resource.description}
                        </p>

                        <div className="space-y-3">
                          <div
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${categoryColors.bg} ${categoryColors.text}`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full mr-2 ${categoryColors.dot}`}
                            ></span>
                            {resource.category} Quality
                          </div>

                          {(resource.link || resource.file) && (
                            <div className="flex gap-2">
                              <a
                                href={getFileUrl(
                                  resource.link || resource.file
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 text-white bg-sky-400 px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group"
                                
                              >
                              
                                {getButtonText(resource.link || resource.file)}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Resource Modal */}
        {showForm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-95 hover:scale-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-xl text-white"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Add New Resource
                  </h2>
                </div>
              </div>

              <form onSubmit={handleAddResource} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter resource title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                    style={{ focusRingColor: colors.primary }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Enter resource description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows="3"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 resize-none"
                    style={{ focusRingColor: colors.primary }}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Link (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com"
                      value={formData.link}
                      onChange={(e) =>
                        setFormData({ ...formData, link: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                      style={{ focusRingColor: colors.primary }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                      style={{ focusRingColor: colors.primary }}
                    >
                      <option value="Good">Good Quality</option>
                      <option value="Low">Low Priority</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx"
                      onChange={(e) =>
                        setFormData({ ...formData, file: e.target.files[0] })
                      }
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <svg
                        className="w-8 h-8 mx-auto mb-2 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <span className="text-sm text-gray-600">
                        Click to upload file (PDF, DOC, PPT)
                      </span>
                      {formData.file && (
                        <p className="text-sm text-green-600 mt-1">
                          {formData.file.name}
                        </p>
                      )}
                    </label>
                  </div>
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
                    Add Resource
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

export default Resources;
