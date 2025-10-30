import React, { useState, useEffect } from "react";
import API from "../../api/api";
import Sidebar from "../../Components/sidebar/Sidebar";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const CounselorChatRoom = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    API.get("/users").then(res => setStudents(res.data.filter(u => u.role === "Student")));
  }, []);

  useEffect(() => {
    if (!selectedStudent) return;
    const room = [user._id, selectedStudent._id].sort().join("_");
    API.get(`/chat/${room}`).then(res => setMessages(res.data));
  }, [selectedStudent]);

  useEffect(() => {
    socket.on("message", data => {
      const room = [user._id, selectedStudent?._id].sort().join("_");
      if (room === [data.senderId, data.receiverId].sort().join("_")) setMessages(prev => [...prev, data]);
    });
    return () => socket.off("message");
  }, [selectedStudent]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedStudent) return;
    const msgData = {
      senderId: user._id,
      receiverId: selectedStudent._id,
      text: newMessage,
    };
    const res = await API.post("/chat", msgData);
    socket.emit("message", res.data);
    setMessages(prev => [...prev, res.data]);
    setNewMessage("");
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="w-72 border-r p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Students</h2>
        {students.map(s => (
          <div key={s._id} onClick={() => setSelectedStudent(s)} className={`p-2 cursor-pointer ${selectedStudent?._id === s._id ? "bg-blue-200" : "hover:bg-gray-100"}`}>
            {s.name}
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        {messages.map(m => (
          <div key={m._id} className={`mb-2 p-2 rounded max-w-xs ${m.senderId._id === user._id ? "bg-blue-500 text-white ml-auto" : "bg-gray-200"}`}>
            {m.text}
          </div>
        ))}
        {selectedStudent && (
          <div className="flex gap-2 mt-auto border-t p-2">
            <input value={newMessage} onChange={e => setNewMessage(e.target.value)} className="flex-1 border rounded p-2"/>
            <button onClick={sendMessage} className="bg-blue-500 text-white px-4 rounded">Send</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CounselorChatRoom;
