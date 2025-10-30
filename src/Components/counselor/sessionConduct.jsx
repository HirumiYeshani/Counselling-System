import React, { useState, useEffect } from "react";
import API from "../../api/api";

const SessionConduct = ({ session, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState("chat");
  const [chatMessage, setChatMessage] = useState("");
  const [sessionData, setSessionData] = useState({
    notes: "",
    resources: [""],
    goals: "",
    actionPlan: "",
    followUpDate: ""
  });
  const [manualZoomLink, setManualZoomLink] = useState("");
  const [manualZoomPassword, setManualZoomPassword] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [localSession, setLocalSession] = useState(session); // Local state for session

  // Keep localSession in sync with prop
  useEffect(() => {
    if (session) {
      setLocalSession(session);
      setSessionData({
        notes: session.notes || "",
        resources: session.resources?.length > 0 ? session.resources : [""],
        goals: session.goals || "",
        actionPlan: session.actionPlan || "",
        followUpDate: session.followUpDate ? session.followUpDate.split('T')[0] : ""
      });
    }
  }, [session]);

  // Auto-refresh chat messages
  useEffect(() => {
    if (activeTab === "chat" && localSession?._id) {
      const interval = setInterval(async () => {
        try {
          const response = await API.get(`/sessions/${localSession._id}`);
          const currentMessageCount = localSession.chatMessages?.length || 0;
          const newMessageCount = response.data.chatMessages?.length || 0;
          
          if (newMessageCount > currentMessageCount) {
            console.log("🔄 Auto-refresh: New messages detected", {
              current: currentMessageCount,
              new: newMessageCount
            });
            setLocalSession(response.data);
            onUpdate(response.data);
          }
        } catch (err) {
          console.error("Failed to refresh chat:", err);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [activeTab, localSession?._id, localSession?.chatMessages?.length, onUpdate]);

  const sendChatMessage = async () => {
    if (!chatMessage.trim() || isSendingMessage) return;

    setIsSendingMessage(true);
    try {
      // 1. Create temporary message
      const tempMessage = {
        _id: `temp-${Date.now()}`,
        sender: "counselor",
        message: chatMessage,
        timestamp: new Date()
      };

      // 2. Update local state immediately
      const optimisticSession = {
        ...localSession,
        chatMessages: [...(localSession.chatMessages || []), tempMessage]
      };
      setLocalSession(optimisticSession);
      setChatMessage("");

      console.log("📝 Optimistic update:", {
        before: localSession.chatMessages?.length,
        after: optimisticSession.chatMessages.length
      });

      // 3. Send to server
      const response = await API.post(`/sessions/${localSession._id}/chat`, {
        sender: "counselor",
        message: chatMessage
      });

      console.log("✅ Server response:", response.data.chatMessages?.length);

      // 4. Update with server response
      setLocalSession(response.data);
      onUpdate(response.data);
      
    } catch (err) {
      console.error("❌ Failed to send message:", err);
      alert("Failed to send message. Please try again.");
      
      // Revert to original session on error
      setLocalSession(session);
      onUpdate(session);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const updateSessionDetails = async () => {
    try {
      const response = await API.put(`/sessions/${localSession._id}`, sessionData);
      alert("Session details updated successfully!");
      setLocalSession(response.data);
      onUpdate(response.data);
    } catch (err) {
      console.error("Failed to update session:", err);
      alert("Failed to update session details.");
    }
  };

  const addResourceField = () => {
    setSessionData({
      ...sessionData,
      resources: [...sessionData.resources, ""]
    });
  };

  const updateResource = (index, value) => {
    const newResources = [...sessionData.resources];
    newResources[index] = value;
    setSessionData({ ...sessionData, resources: newResources });
  };

  // Create Zoom meeting
  const createZoomMeeting = async () => {
    try {
      const response = await API.post(`/sessions/${localSession._id}/zoom/create`);
      console.log("✅ Zoom meeting created:", response.data);
      alert('Zoom meeting created successfully!');
      setLocalSession(response.data);
      onUpdate(response.data);
    } catch (err) {
      console.error('❌ Failed to create Zoom meeting:', err);
      alert('Failed to create Zoom meeting. Please try again.');
    }
  };

  // Add manual Zoom link
  const addManualZoomLink = async () => {
    if (!manualZoomLink.trim()) {
      alert("Please enter a Zoom meeting link");
      return;
    }

    try {
      const response = await API.post(`/sessions/${localSession._id}/zoom/manual`, {
        joinUrl: manualZoomLink,
        password: manualZoomPassword
      });
      console.log("✅ Manual Zoom link added:", response.data);
      alert('Zoom link added successfully!');
      setManualZoomLink("");
      setManualZoomPassword("");
      setLocalSession(response.data);
      onUpdate(response.data);
    } catch (err) {
      console.error('❌ Failed to add Zoom link:', err);
      alert('Failed to add Zoom link. Please try again.');
    }
  };

  const completeSession = async () => {
    try {
      const response = await API.put(`/sessions/${localSession._id}`, {
        ...sessionData,
        status: "Completed"
      });
      alert("Session marked as completed!");
      setLocalSession(response.data);
      onUpdate(response.data);
      onClose();
    } catch (err) {
      console.error("Failed to complete session:", err);
      alert("Failed to complete session.");
    }
  };

  // Use localSession instead of session for rendering
  const currentSession = localSession || session;

  if (!currentSession) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-sky-400 text-white p-6 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Conducting Session</h2>
              <p className="text-sky-100">
                With {currentSession.student?.name || "Student"} - {currentSession.topic}
              </p>
              <p className="text-sky-100 text-sm">
                Messages: {currentSession.chatMessages?.length || 0}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-sky-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 flex-shrink-0">
          <nav className="flex -mb-px">
            {["chat", "zoom", "notes", "resources", "goals", "action"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-sky-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full p-6 overflow-auto">
            {/* Chat Tab */}
            {activeTab === "chat" && (
              <div className="h-full flex flex-col">
                <div className="bg-gray-50 rounded-lg p-4 flex-1 overflow-y-auto mb-4">
                  {currentSession.chatMessages?.map((msg, index) => (
                    <div
                      key={msg._id || index}
                      className={`mb-3 ${
                        msg.sender === "counselor" ? "text-right" : "text-left"
                      }`}
                    >
                      <div
                        className={`inline-block px-4 py-2 rounded-2xl max-w-xs ${
                          msg.sender === "counselor"
                            ? "bg-sky-500 text-white"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {msg.message}
                        {msg._id?.startsWith('temp-') && " ⏳"}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                        {msg._id?.startsWith('temp-') && " (Sending...)"}
                      </div>
                    </div>
                  ))}
                  {(!currentSession.chatMessages || currentSession.chatMessages.length === 0) && (
                    <p className="text-gray-500 text-center py-8">No messages yet. Start the conversation!</p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    placeholder="Type your message..."
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    disabled={isSendingMessage}
                  />
                  <button
                    onClick={sendChatMessage}
                    disabled={isSendingMessage || !chatMessage.trim()}
                    className="bg-sky-400 text-white px-6 py-2 rounded-xl hover:bg-sky-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isSendingMessage ? "Sending..." : "Send"}
                  </button>
                </div>
              </div>
            )}

            {/* Other tabs remain the same but use currentSession */}
            {activeTab === "zoom" && (
              <div className="h-full overflow-auto">
                {currentSession.zoomMeeting ? (
                  <div className="space-y-6">
                    {/* Existing Zoom content */}
                    <div className="border-t pt-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Add/Update Zoom Meeting</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Zoom Meeting Link *
                          </label>
                          <input
                            type="url"
                            value={manualZoomLink}
                            onChange={(e) => setManualZoomLink(e.target.value)}
                            placeholder="https://zoom.us/j/123456789"
                            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Meeting Password (Optional)
                          </label>
                          <input
                            type="text"
                            value={manualZoomPassword}
                            onChange={(e) => setManualZoomPassword(e.target.value)}
                            placeholder="Enter password if required"
                            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                        </div>
                        <button
                          onClick={addManualZoomLink}
                          className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 w-full"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Update Zoom Link
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Auto Zoom Creation */}
                    <div className="text-center py-4">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">No Zoom Meeting</h3>
                      <p className="text-gray-600 mb-4">Create a Zoom meeting for this session</p>
                      <button
                        onClick={createZoomMeeting}
                        className="bg-sky-500 text-white px-6 py-3 rounded-xl hover:bg-sky-600 transition-colors flex items-center justify-center gap-2 mx-auto"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Auto Zoom Meeting
                      </button>
                    </div>

                    {/* Manual Zoom Link Addition */}
                    <div className="border-t pt-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Or Add Manual Zoom Link</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Zoom Meeting Link *
                          </label>
                          <input
                            type="url"
                            value={manualZoomLink}
                            onChange={(e) => setManualZoomLink(e.target.value)}
                            placeholder="https://zoom.us/j/123456789"
                            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Meeting Password (Optional)
                          </label>
                          <input
                            type="text"
                            value={manualZoomPassword}
                            onChange={(e) => setManualZoomPassword(e.target.value)}
                            placeholder="Enter password if required"
                            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                        </div>
                        <button
                          onClick={addManualZoomLink}
                          className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 w-full"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Add Manual Zoom Link
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
   {/* Notes Tab */}
            {activeTab === "notes" && (
              <div className="h-full flex flex-col">
                <textarea
                  value={sessionData.notes}
                  onChange={(e) => setSessionData({ ...sessionData, notes: e.target.value })}
                  placeholder="Enter session notes..."
                  className="flex-1 w-full border border-gray-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                />
                <div className="mt-4 flex-shrink-0">
                  <button
                    onClick={updateSessionDetails}
                    className="bg-sky-400 text-white px-6 py-2 rounded-xl hover:bg-sky-500 transition-colors"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            )}
          
            {/* Resources Tab */}
            {activeTab === "resources" && (
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto mb-4">
                  {sessionData.resources.map((resource, index) => (
                    <input
                      key={index}
                      type="text"
                      value={resource}
                      onChange={(e) => updateResource(index, e.target.value)}
                      placeholder="Enter resource URL or description"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  ))}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={addResourceField}
                    className="bg-gray-500 text-white px-4 py-2 rounded-xl hover:bg-gray-600 transition-colors"
                  >
                    Add Resource
                  </button>
                  <button
                    onClick={updateSessionDetails}
                    className="bg-sky-400 text-white px-6 py-2 rounded-xl hover:bg-sky-500 transition-colors"
                  >
                    Save Resources
                  </button>
                </div>
              </div>
            )}

            {/* Goals Tab */}
            {activeTab === "goals" && (
              <div className="h-full flex flex-col">
                <textarea
                  value={sessionData.goals}
                  onChange={(e) => setSessionData({ ...sessionData, goals: e.target.value })}
                  placeholder="Enter session goals..."
                  className="flex-1 w-full border border-gray-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                />
                <div className="mt-4 flex-shrink-0">
                  <button
                    onClick={updateSessionDetails}
                    className="bg-sky-400 text-white px-6 py-2 rounded-xl hover:bg-sky-500 transition-colors"
                  >
                    Save Goals
                  </button>
                </div>
              </div>
            )}

            {/* Action Plan Tab */}
            {activeTab === "action" && (
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  <textarea
                    value={sessionData.actionPlan}
                    onChange={(e) => setSessionData({ ...sessionData, actionPlan: e.target.value })}
                    placeholder="Enter action plan..."
                    className="w-full border border-gray-300 rounded-xl p-4 mb-4 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                    rows={8}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Follow-up Date
                      </label>
                      <input
                        type="date"
                        value={sessionData.followUpDate}
                        onChange={(e) => setSessionData({ ...sessionData, followUpDate: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex-shrink-0">
                  <button
                    onClick={updateSessionDetails}
                    className="bg-sky-400 text-white px-6 py-2 rounded-xl hover:bg-sky-500 transition-colors"
                  >
                    Save Action Plan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
            
        
        
        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex-shrink-0">
          <div className="flex justify-between">
            <button
              onClick={completeSession}
              className="bg-blue-500 text-white px-6 py-2 rounded-xl hover:bg-blue-600 transition-colors"
            >
              Complete Session
            </button>
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-6 py-2 rounded-xl hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionConduct;