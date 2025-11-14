import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Student_sidebar from "../../Components/sidebar/Student_sidebar";

const MindBot = () => {
  const [prompt, setPrompt] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const [isTyping, setIsTyping] = useState(false);
  const [typingPaused, setTypingPaused] = useState(false);

  const historyEndRef = useRef(null);
  const answerEndRef = useRef(null);
  const typingIntervalRef = useRef(null);

  const studentId = localStorage.getItem("userId");

  useEffect(() => {
    if (studentId) fetchHistory();
    else setError("Please log in to use MindBot");
  }, [studentId]);

  useEffect(() => {
    scrollToBottom();
  }, [answer, history]);

  const scrollToBottom = () => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
    answerEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchHistory = async () => {
    try {
      setError("");
      const res = await axios.get(
        `http://localhost:5000/api/gemini/history?studentId=${studentId}`
      );
      setHistory(res.data);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("Failed to load history");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || !studentId) return;

    setLoading(true);
    setError("");
    setAnswer("");

    setIsTyping(true);
    setTypingPaused(false);
    setLastQuestion(prompt.trim());

    try {
      const res = await axios.post("http://localhost:5000/api/gemini/ask", {
        prompt: prompt.trim(),
        studentId,
      });

      await typeAnswer(res.data.answer);
      setPrompt("");
      await fetchHistory();
    } catch (err) {
      console.error("Error asking AI:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.details ||
        "Failed to get response from AI";
      setError(errorMessage);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const typeAnswer = async (text) => {
    setAnswer("");
    let currentIndex = 0;
    
    // Clear any existing interval
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    typingIntervalRef.current = setInterval(() => {
      if (!typingPaused && currentIndex < text.length) {
        setAnswer(prev => prev + text[currentIndex]);
        currentIndex++;
      } else if (currentIndex >= text.length) {
        clearInterval(typingIntervalRef.current);
        setIsTyping(false);
      }
    }, 10);
  };


  const quickQuestions = [
    { question: "Ways to stay motivated daily",  },
    { question: "How to handle academic pressure?",},
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Sidebar */}
      <Student_sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full px-4 py-4">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-sky-400 to-blue-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-sky-400 bg-clip-text text-transparent">
                MindBot AI
              </h1>
              <p className="text-gray-600 text-sm">
                Your intelligent learning assistant
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4 bg-white rounded-t-xl px-2">
          {["chat", "history"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium text-sm rounded-t-lg transition-all relative ${
                activeTab === tab
                  ? "text-blue-600 bg-gradient-to-b from-white to-gray-50 border-t-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "chat" ? " Chat" : " History"}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"></div>
              )}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 shadow-sm">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <svg
                  className="w-4 h-4 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <span className="text-red-700 font-medium text-sm">{error}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
          {/* Chat Section */}
          {activeTab === "chat" && (
            <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-xl border border-gray-100 p-6 h-[calc(100vh-180px)] min-h-[500px]">
              {/* Chat Messages */}
              {lastQuestion ? (
                <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-3">
                  <div className="space-y-3">
                    {/* User Question */}
                    <div className="flex justify-end">
                      <div className="bg-gradient-to-r from-blue-500 to-sky-400 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-[85%] shadow-lg">
                        <div className="flex items-center mb-1">
                          <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center mr-2">
                            <span className="text-xs">👤</span>
                          </div>
                          <span className="text-sm font-medium opacity-90">You</span>
                        </div>
                        <p className="text-white/95 leading-relaxed text-sm">
                          {lastQuestion}
                        </p>
                      </div>
                    </div>

                    {/* AI Response */}
                    <div className="flex justify-start">
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 max-w-[85%] shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="w-7 h-7 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full flex items-center justify-center mr-3 shadow-md">
                              <span className="text-xs text-white">AI</span>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-700">MindBot</span>
                              <div className="flex items-center text-xs text-gray-500">
                                <div
                                  className={`w-2 h-2 rounded-full mr-2 ${
                                    isTyping ? "bg-blue-400 animate-pulse" : "bg-sky-400"
                                  }`}
                                ></div>
                                {isTyping ? "Typing..." : typingPaused ? "Paused" : "Online"}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                          {answer}
                          {isTyping && (
                            <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse"></span>
                          )}
                        </p>

                   
                      </div>
                    </div>
                    <div ref={answerEndRef} />
                  </div>
                </div>
              ) : (
                // Welcome message when no conversation yet
                <div className="flex-1 flex flex-col items-center justify-center mb-4 text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4">
                    <span className="text-4xl">🐻‍❄️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Welcome to MindBot!
                  </h3>
                  <p className="text-gray-500 text-sm max-w-md">
                    Ask me anything about your studies, and I'll help you learn better.
                    Try one of the quick suggestions below to get started!
                  </p>
                </div>
              )}

              {/* Input Area */}
              <div className="border-t border-purple-100 pt-4">
                <form onSubmit={handleSubmit} className="mb-4">
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-gray-400">💭</div>
                    <input
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Ask MindBot anything about your studies..."
                      className="w-full border border-purple-200 pl-10 pr-28 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-gray-50 transition-all text-gray-700 placeholder-gray-500 text-sm"
                      disabled={loading || isTyping}
                    />
                    <button
                      type="submit"
                      disabled={loading || !prompt.trim() || isTyping}
                      className="absolute right-2 top-1.5 bg-gradient-to-r from-blue-400 to-sky-300 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl text-sm"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                          Thinking...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span>Ask</span>
                          <svg
                            className="w-3 h-3 ml-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 5l7 7-7 7M5 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  </div>
                </form>

                {/* Quick Suggestions */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center text-lg">
                    Quick Suggestions
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {quickQuestions.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => setPrompt(item.question)}
                        disabled={loading || isTyping}
                        className="text-left p-3 bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-purple-50 border border-gray-200 rounded-lg transition-all duration-200 hover:border-blue-300 hover:shadow-md group disabled:opacity-50"
                      >
                        <div className="flex items-center">
                          <span className="text-base mr-2 group-hover:scale-110 transition-transform">
                            {item.icon}
                          </span>
                          <span className="text-xs text-gray-700 font-medium">
                            {item.question}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* History Section */}
          {activeTab === "history" && (
            <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-xl border border-gray-100 p-6 h-[calc(100vh-180px)] min-h-[500px]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    Question History
                  </h2>
                  <p className="text-gray-600 text-xs mt-1">
                    Your previous conversations with MindBot
                  </p>
                </div>
                <button
                  onClick={fetchHistory}
                  className="bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-purple-50 text-gray-600 hover:text-blue-600 p-2 rounded-lg hover:shadow-md transition-all duration-200 border border-gray-200"
                  title="Refresh history"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>

              {history.length === 0 ? (
                <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-blue-100 rounded-2xl flex items-center justify-center mb-4">
                    <span className="text-2xl">💬</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No conversations yet
                  </h3>
                  <p className="text-gray-500 text-sm max-w-xs">
                    Start a conversation with MindBot to see your question history here!
                  </p>
                  <button
                    onClick={() => setActiveTab("chat")}
                    className="mt-4 bg-gradient-to-r from-blue-500 to-sky-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl text-sm"
                  >
                    Start Chatting
                  </button>
                </div>
              ) : (
                <div className="space-y-4 overflow-y-auto pr-3 flex-1">
                  {history.map((item) => (
                    <div
                      key={item._id}
                      className="border border-gray-200 rounded-xl p-4 bg-gradient-to-r from-white to-gray-50 hover:shadow-lg transition-all duration-300 hover:border-blue-200 group"
                    >
                      <div className="mb-3">
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-2 flex-shrink-0 group-hover:scale-110 transition-transform">
                            <span className="text-blue-600 text-xs">👤</span>
                          </div>
                          <div>
                            <span className="text-gray-800 font-semibold block text-sm">
                              {item.question}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-2 flex-shrink-0 group-hover:scale-110 transition-transform">
                            <span className="text-green-600 text-xs">AI</span>
                          </div>
                          <div>
                            <span className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm">
                              {item.answer}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {new Date(item.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                  <div ref={historyEndRef} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MindBot;