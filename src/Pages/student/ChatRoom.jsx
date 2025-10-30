import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import Student_sidebar from "../../Components/sidebar/Student_sidebar";
import API from "../../api/api";

const socket = io("http://localhost:5000");

const ChatRoom = () => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) window.location.href = "/login";
    else setUser(storedUser);
  }, []);

  useEffect(() => {
    if (!user) return;

    const counselorId = "COUNSELOR_ID_HERE"; // Replace with actual counselor id
    const room = [user._id, counselorId].sort().join("_");
    setRoomId(room);

    API.get(`/chat/${room}`).then(res => setMessages(res.data));
  }, [user]);

  useEffect(() => {
    socket.on("message", data => {
      const room = [user?._id, data.receiverId?._id].sort().join("_");
      if (room === roomId) setMessages(prev => [...prev, data]);
    });
    return () => socket.off("message");
  }, [user, roomId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const msgData = {
      senderId: user._id,
      receiverId: "COUNSELOR_ID_HERE",
      text: newMessage,
    };

    const res = await API.post("/chat", msgData);
    socket.emit("message", res.data);
    setMessages(prev => [...prev, res.data]);
    setNewMessage("");
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="flex h-screen">
      <Student_sidebar />
      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        {messages.map(m => (
          <div key={m._id} className={m.senderId._id === user._id ? "text-right" : "text-left"}>
            <span className={`inline-block p-2 rounded ${m.senderId._id === user._id ? "bg-blue-500 text-white" : "bg-gray-300"}`}>
              <strong>{m.senderId.name}: </strong>{m.text}
            </span>
          </div>
        ))}
      </div>
      <div className="p-4 flex gap-2">
        <input value={newMessage} onChange={e => setNewMessage(e.target.value)} className="flex-1 border rounded p-2"/>
        <button onClick={sendMessage} className="bg-blue-500 text-white px-4 rounded">Send</button>
      </div>
    </div>
  );
};

export default ChatRoom;
