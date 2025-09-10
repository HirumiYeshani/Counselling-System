import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../Components/Sidebar";

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
    category: "Good",
  });

  const baseURL = "http://localhost:5000/api/resources";

  // Fetch resources
  const fetchResources = async () => {
    try {
      const res = await axios.get(baseURL);
      setResources(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // Add new resource
  const handleAddResource = async (e) => {
    e.preventDefault();
    try {
      await axios.post(baseURL, formData);
      setFormData({ title: "", description: "", link: "", category: "Good" });
      setShowForm(false);
      fetchResources();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete resource
  const handleDeleteResource = async (id) => {
    try {
      await axios.delete(`${baseURL}/${id}`);
      fetchResources();
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered resources
  const filteredResources =
    filter === "All" ? resources : resources.filter((r) => r.category === filter);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-700 mb-6">Resources</h1>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            Add Resource
          </button>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="All">All</option>
            <option value="Good">Good</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.length > 0 ? (
            filteredResources.map((res) => (
              <div
                key={res._id}
                className="bg-white p-5 rounded-xl shadow hover:shadow-2xl transition relative"
              >
                <button
                  onClick={() => handleDeleteResource(res._id)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
                <h2 className="text-lg font-semibold text-blue-500">{res.title}</h2>
                <p className="text-gray-600">{res.description}</p>
                <a
                  href={res.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-blue-600 hover:underline"
                >
                  View Resource →
                </a>
              </div>
            ))
          ) : (
            <p className="col-span-full text-gray-500 text-center">No resources available</p>
          )}
        </div>

        {/* Add Resource Modal */}
        {showForm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-96">
              <h2 className="text-xl font-bold mb-4">Add Resource</h2>
              <form onSubmit={handleAddResource} className="space-y-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="url"
                  placeholder="Link"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="Good">Good</option>
                  <option value="Low">Low</option>
                </select>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Add
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
