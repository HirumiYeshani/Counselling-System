import React, { useEffect, useState } from "react";
import API from "../api/api";

const Notifications = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  },);

  const fetchNotifications = async () => {
    try {
      const res = await API.get(`/notifications/${userId}`);
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/read/${id}`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  return (
    <div className="p-4 bg-black shadow rounded-lg w-full max-w-md">
      <h2 className="text-xl font-bold mb-3">Notifications</h2>
      {notifications.length === 0 && <p>No notifications</p>}
      <ul className="space-y-2">
        {notifications.map((n) => (
          <li
            key={n._id}
            className={`p-3 rounded-lg border cursor-pointer ${n.read ? "bg-gray-100" : "bg-blue-50 border-blue-300"}`}
            onClick={() => !n.read && markAsRead(n._id)}
          >
            {n.message}
            {!n.read && <span className="ml-2 text-xs text-blue-600 font-semibold">New</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
