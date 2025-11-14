import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import bot from "../../assets/Images/bot.webp";

// Interactive Card Component
const InteractiveCard = ({
  isOpen,
  onClose,
  title,
  content,
  onAskQuestion,
}) => {
  const [question, setQuestion] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (question.trim()) {
      onAskQuestion(question);
      setQuestion("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-sky-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">💡</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
              <p className="text-sm text-gray-500">
                Ask a question about this topic
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed">{content}</p>
          </div>
        </div>

        {/* Question Input */}
        <div className="p-6 border-t border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label
                htmlFor="question"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Your Question
              </label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={`Ask about ${title.toLowerCase()}...`}
                rows="3"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={!question.trim()}
              className="w-full bg-sky-500 text-white px-6 py-3 rounded-xl hover:bg-sky-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Ask Question
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description, onCardClick }) => {
  return (
    <div
      onClick={onCardClick}
      className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group hover:bg-white"
    >
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-sky-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
          <span className="text-white text-2xl">{icon}</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          {description}
        </p>
        <button className="text-sky-600 hover:text-sky-700 font-medium text-sm flex items-center justify-center space-x-1 group-hover:scale-105 transition-transform">
          <span>Learn More</span>
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Stats Component
const StatCard = ({ number, label }) => (
  <div className="text-center">
    <div className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
      {number}
    </div>
    <div className="text-white/90 text-sm font-medium drop-shadow">{label}</div>
  </div>
);

// MindBot Chat Modal Component - COMPLETELY UPDATED WITH TYPING ANIMATION
const MindBotChatModal = ({ isOpen, onClose, initialQuestion }) => {
  const [prompt, setPrompt] = useState(initialQuestion || "");
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentTypingMessage, setCurrentTypingMessage] = useState("");
  const chatContainerRef = useRef(null);
  const typingIntervalRef = useRef(null);

  // For demo - replace with actual student ID from your auth system
  const studentId = "demo-student-123";

  React.useEffect(() => {
    if (initialQuestion && isOpen) {
      setPrompt(initialQuestion);
      // Auto-submit the initial question after modal opens
      setTimeout(() => {
        handleSubmit({ preventDefault: () => {} }, initialQuestion);
      }, 500);
    }
  }, [initialQuestion, isOpen]);

  // Typing animation function
  const typeMessage = (message) => {
    return new Promise((resolve) => {
      let currentIndex = 0;
      setCurrentTypingMessage("");
      setIsTyping(true);

      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }

      typingIntervalRef.current = setInterval(() => {
        if (currentIndex < message.length) {
          setCurrentTypingMessage((prev) => prev + message[currentIndex]);
          currentIndex++;
        } else {
          clearInterval(typingIntervalRef.current);
          setIsTyping(false);
          resolve();
        }
      }, 20); // Adjust typing speed here (lower = faster)
    });
  };

  const handleSubmit = async (e, customPrompt = null) => {
    e.preventDefault();
    const question = customPrompt || prompt.trim();
    if (!question) return;

    setLoading(true);
    if (!customPrompt) setPrompt("");

    // Add user question to conversation immediately
    const userMessage = { type: "user", content: question };
    setConversation((prev) => [...prev, userMessage]);

    try {
      // Call your backend API
      const response = await fetch("/api/gemini/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: question,
          studentId: studentId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add AI response placeholder to conversation
      const aiMessagePlaceholder = {
        type: "ai",
        content: "",
        isTyping: true,
      };
      setConversation((prev) => [...prev, aiMessagePlaceholder]);

      // Start typing animation
      await typeMessage(data.answer);

      // Replace placeholder with actual message
      setConversation((prev) => {
        const newConversation = [...prev];
        const lastMessage = newConversation[newConversation.length - 1];
        if (lastMessage.isTyping) {
          newConversation[newConversation.length - 1] = {
            type: "ai",
            content: data.answer,
          };
        }
        return newConversation;
      });
    } catch (err) {
      console.error("Error calling AI API:", err);

      // Fallback responses if API fails
      const fallbackResponse = getFallbackResponse(question);

      // Add AI response placeholder to conversation
      const aiMessagePlaceholder = {
        type: "ai",
        content: "",
        isTyping: true,
      };
      setConversation((prev) => [...prev, aiMessagePlaceholder]);

      // Start typing animation for fallback
      await typeMessage(fallbackResponse);

      // Replace placeholder with fallback message
      setConversation((prev) => {
        const newConversation = [...prev];
        const lastMessage = newConversation[newConversation.length - 1];
        if (lastMessage.isTyping) {
          newConversation[newConversation.length - 1] = {
            type: "ai",
            content: fallbackResponse,
          };
        }
        return newConversation;
      });
    } finally {
      setLoading(false);
    }
  };

  // Enhanced fallback responses
  const getFallbackResponse = (question) => {
    const lowerQuestion = question.toLowerCase();

    if (
      lowerQuestion.includes("stress") ||
      lowerQuestion.includes("anxious") ||
      lowerQuestion.includes("overwhelmed")
    ) {
      return `I understand you're feeling stressed 😔\n\nHere are some calming techniques:\n\n🌊 Deep Breathing: Inhale for 4 counts, hold for 7, exhale for 8\n🌿 Grounding: Notice 5 things you see, 4 things you feel, 3 things you hear\n🎵 Music Therapy: Listen to calming instrumental music\n💧 Hydrate: Drink a glass of water slowly\n🔄 Break: Step away for 5 minutes and breathe\n\nRemember, it's okay to take things one moment at a time ✨`;
    } else if (
      lowerQuestion.includes("sad") ||
      lowerQuestion.includes("depress") ||
      lowerQuestion.includes("down")
    ) {
      return `I hear you're going through a tough time 💙\n\nSmall steps that might help:\n\n☀️ Morning Light: Spend 10 minutes in sunlight\n🚶 Gentle Movement: A short walk around the block\n📞 Connection: Text or call someone you trust\n🎨 Creative Break: Draw, write, or listen to music\n💧 Hydration: Sip some water or herbal tea\n📝 One Thing: Complete one small task today\n\nBe gentle with yourself - healing takes time 🌱`;
    } else if (
      lowerQuestion.includes("study") ||
      lowerQuestion.includes("exam") ||
      lowerQuestion.includes("homework")
    ) {
      return `Academic success strategies 📚✨\n\n🎯 Pomodoro Method: 25min study, 5min break\n🌈 Color Coding: Use different colors for subjects\n🗓️ Study Schedule: Plan specific times for each topic\n💤 Sleep Well: 7-8 hours before exams\n🍎 Brain Food: Nuts, fruits, and plenty of water\n🔄 Active Recall: Test yourself instead of re-reading\n🎵 Focus Music: Lo-fi or classical for concentration\n\nYou've got this! One step at a time 🚀`;
    } else if (
      lowerQuestion.includes("career") ||
      lowerQuestion.includes("future") ||
      lowerQuestion.includes("job")
    ) {
      return `Career guidance insights 💼🌟\n\n🔍 Self-Reflection: What activities make you lose track of time?\n📊 Skills Assessment: List your strengths and interests\n🌐 Research: Explore different career paths online\n👥 Networking: Talk to professionals in fields you like\n🎓 Courses: Consider online courses to build skills\n📝 Internships: Gain practical experience\n💫 Passion Projects: Work on personal projects that excite you\n\nYour career journey is unique - explore with curiosity! 🗺️`;
    } else if (
      lowerQuestion.includes("sleep") ||
      lowerQuestion.includes("tired") ||
      lowerQuestion.includes("insomnia")
    ) {
      return `Better sleep tips 🌙💤\n\n📵 Digital Detox: No screens 1 hour before bed\n🌅 Consistent Schedule: Same bedtime and wake time\n🌡️ Cool Room: Optimal temperature 65-68°F (18-20°C)\n🍵 Herbal Tea: Chamomile or lavender tea before bed\n📖 Relaxing Routine: Read, meditate, or gentle stretching\n🌌 Dark Environment: Use blackout curtains if needed\n📝 Worry Journal: Write down thoughts before sleeping\n\nSweet dreams and restful sleep! 🌠`;
    } else if (
      lowerQuestion.includes("relationship") ||
      lowerQuestion.includes("friend") ||
      lowerQuestion.includes("family")
    ) {
      return `Relationship guidance 💕\n\n👂 Active Listening: Focus on understanding, not just responding\n💬 Open Communication: Share feelings honestly and kindly\n🎯 Boundaries: Know your limits and communicate them clearly\n🤝 Empathy: Try to see things from their perspective\n🌱 Growth: Relationships need care and attention to flourish\n⚖️ Balance: Healthy relationships have give and take\n\nEvery relationship is a journey of learning and growth 🌈`;
    } else if (
      lowerQuestion.includes("motivation") ||
      lowerQuestion.includes("procrastination") ||
      lowerQuestion.includes("lazy")
    ) {
      return `Finding motivation 🎯\n\n🍎 Two-Minute Rule: If it takes less than 2 minutes, do it now\n📋 Break It Down: Divide big tasks into tiny steps\n🎉 Reward System: Treat yourself after completing tasks\n👥 Accountability: Share goals with a friend\n🌅 Morning Routine: Start with one productive thing\n📊 Progress Tracking: Celebrate small wins\n💫 "Just Start": Often the hardest part is beginning\n\nMomentum builds with action - you can do this! ⚡`;
    } else if (
      lowerQuestion.includes("hi") ||
      lowerQuestion.includes("hello") ||
      lowerQuestion.includes("hey")
    ) {
      return `Hello there! 🌟 I'm MindBot, your friendly AI counseling assistant!\n\nI'm here to help you with:\n\n📚 Academic challenges and study strategies\n💼 Career guidance and future planning\n😌 Stress management and emotional support\n💤 Sleep issues and relaxation techniques\n🎯 Goal setting and personal development\n🍎 Health and wellness advice\n🤝 Relationship and social guidance\n\nWhat's on your mind today? I'm here to listen and help! 💫`;
    } else {
      return `Thank you for your question! 🌟\n\nI'm here to help you with:\n\n📚 Academic challenges and study strategies\n💼 Career guidance and future planning\n😌 Stress management and emotional support\n💤 Sleep issues and relaxation techniques\n🎯 Goal setting and personal development\n🍎 Health and wellness advice\n🤝 Relationship and social guidance\n\nCould you tell me more about what's on your mind? I'm here to listen and help! 💫`;
    }
  };

  const quickQuestions = [
    { question: "I'm feeling stressed about exams", icon: "😰" },
    { question: "How can I improve my study habits?", icon: "📚" },
    { question: "I'm having trouble sleeping", icon: "🌙" },
    { question: "Career guidance for my future", icon: "💼" },
    { question: "Dealing with sadness and low mood", icon: "😔" },
    { question: "Time management strategies", icon: "⏰" },
  ];

  // Scroll to bottom when conversation updates
  React.useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [conversation, currentTypingMessage]);

  // Load conversation history when modal opens
  React.useEffect(() => {
    if (isOpen && conversation.length === 0) {
      loadConversationHistory();
    }
  }, [isOpen]);

  // Cleanup typing interval on unmount
  React.useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  const loadConversationHistory = async () => {
    try {
      const response = await fetch(
        `/api/gemini/history?studentId=${studentId}`
      );
      if (response.ok) {
        const history = await response.json();
        if (history && history.length > 0) {
          // Convert history to conversation format
          const conversationHistory = history
            .flatMap((item) => [
              { type: "user", content: item.question },
              { type: "ai", content: item.answer },
            ])
            .slice(-10); // Show last 10 conversations
          setConversation(conversationHistory);
        }
      }
    } catch (err) {
      console.error("Error loading history:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      <div className="absolute right-0 top-0 h-full w-full max-w-lg transform transition-transform duration-300 ease-in-out">
        <div className="bg-white h-full flex flex-col shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-sky-400 to-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  MindBot Assistant
                </h3>
                <p className="text-sm text-gray-500">
                  Your AI counseling partner
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50"
          >
            {conversation.length === 0 && !isTyping && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-r from-sky-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">🤖</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Welcome to MindBot!
                </h3>
                <p className="text-gray-600 max-w-md text-sm mx-auto">
                  I'm your AI counseling assistant. I can help with academic
                  stress, career guidance, study strategies, emotional support,
                  and personal development.
                </p>
              </div>
            )}

            {conversation.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.type === "user"
                      ? "bg-sky-500 text-white rounded-br-none"
                      : "bg-white border border-gray-200 rounded-bl-none shadow-sm"
                  }`}
                >
                  <div className="flex items-center mb-1">
                    {msg.type === "ai" && (
                      <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center mr-2">
                        <span className="text-sky-600 text-xs font-bold">
                          AI
                        </span>
                      </div>
                    )}
                    <span className="text-sm font-medium opacity-90">
                      {msg.type === "user" ? "You" : "MindBot"}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator with actual message being typed */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%] bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                  <div className="flex items-center mb-1">
                    <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center mr-2">
                      <span className="text-sky-600 text-xs font-bold">AI</span>
                    </div>
                    <span className="text-sm font-medium opacity-90">
                      MindBot
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {currentTypingMessage}
                    <span className="inline-block w-2 h-4 bg-sky-500 ml-1 animate-pulse"></span>
                  </p>
                </div>
              </div>
            )}

            {loading && !isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%] bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                  <div className="flex items-center mb-1">
                    <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center mr-2">
                      <span className="text-sky-600 text-xs font-bold">AI</span>
                    </div>
                    <span className="text-sm font-medium opacity-90">
                      MindBot
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <span>Thinking</span>
                    <span className="flex ml-2 space-x-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                      <span
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></span>
                      <span
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></span>
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {conversation.length === 0 && !loading && !isTyping && (
            <div className="px-6 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Quick questions to get started:
              </h4>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {quickQuestions.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setPrompt(item.question);
                      handleSubmit({ preventDefault: () => {} }, item.question);
                    }}
                    disabled={loading || isTyping}
                    className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-sky-300 hover:bg-sky-50 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center">
                      <span className="text-lg mr-2 group-hover:scale-110 transition-transform">
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
          )}

          <div className="p-6 border-t border-gray-200">
            <form onSubmit={handleSubmit} className="flex space-x-3">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask about stress, studies, career, or anything else..."
                className="flex-1 border border-gray-300 rounded-xl text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                disabled={loading || isTyping}
              />
              <button
                type="submit"
                disabled={loading || !prompt.trim() || isTyping}
                className="bg-sky-500 text-white px-6 py-3 rounded-xl hover:bg-sky-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2 min-w-20 justify-center"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Send</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// Floating Bot Button
const FloatingBotButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-50 h-50 flex items-center justify-center hover:scale-110 transition-transform duration-300 z-40 group"
    >
      <div className="relative">
        <img
          src={bot}
          alt="MindBot"
          className="w-28 h-auto object-contain drop-shadow-2xl"
        />
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-sky-400 rounded-full border-2 border-white animate-pulse"></div>
      </div>

      <div className="absolute -top-12 right-0 bg-gray-900 text-white text-xs py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        Ask MindBot AI
      </div>
    </button>
  );
};

// Updated Hero Section with Sky Blue Theme
const HeroSection = () => {
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [initialQuestion, setInitialQuestion] = useState("");

  const handleAskQuestion = (question) => {
    setInitialQuestion(question);
    setIsCardOpen(false);
    setIsBotOpen(true);
  };

  // Features data
  const features = [
    {
      icon: "📅",
      title: "Smart Scheduling",
      description:
        "Automated appointment booking with intelligent reminders and calendar sync",
    },
    {
      icon: "📊",
      title: "Progress Analytics",
      description:
        "Track client outcomes and measure treatment effectiveness with detailed insights",
    },
    {
      icon: "🔒",
      title: "Secure Notes",
      description:
        "HIPAA-compliant client documentation with end-to-end encryption",
    },
    {
      icon: "💬",
      title: "Client Portal",
      description:
        "Seamless communication and resource sharing with your clients",
    },
  ];

  return (
    <>
      {/* Sky Blue Themed Hero Section */}
      <section className=" relative overflow-hidden bg-gradient-to-br from-sky-50 via-sky-100 to-blue-100 b">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-sky-200/40 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-sky-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mt-28 mb-36 flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
            {/* Left Content */}
            <div className="text-gray-800 space-y-8">
              <div className="space-y-6">
                {/* Trust Badge */}
                <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-sky-200 shadow-sm">
                  <span className="text-sm font-medium text-gray-700">
                    Trusted by 5,000+ Counseling Professionals
                  </span>
                </div>

                {/* Main Heading */}
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  Transform Your
                  <span className="block text-sky-600 mt-2 bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                    Therapy Practice
                  </span>
                </h1>

                {/* Description */}
                <p className="text-xl md:text-2xl text-gray-700 leading-relaxed max-w-2xl">
                  The comprehensive practice management platform built
                  exclusively for mental health professionals. Streamline your
                  workflow, enhance client outcomes, and grow your practice with
                  AI-powered tools.
                </p>

                {/* Feature Highlights */}
                <div className="flex items-center space-x-6 text-gray-700">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">HIPAA Compliant</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      AI-Powered Insights
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      Secure & Private
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Feature Showcase */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-2xl">
                {/* Main Feature Grid */}
                <div className="grid grid-cols-2 gap-6">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-sky-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
                    >
                      <div className="text-center">
                        <div className="w-14 h-14 bg-gradient-to-r from-sky-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          <span className="text-white text-xl">
                            {feature.icon}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-sky-300/20 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-300/20 rounded-full blur-xl animate-pulse delay-1000"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-sky-400 animate-bounce">
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
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      {/* Floating Bot Button */}
      <FloatingBotButton onClick={() => setIsBotOpen(true)} />

      {/* MindBot Chat Modal */}
      <MindBotChatModal
        isOpen={isBotOpen}
        onClose={() => {
          setIsBotOpen(false);
          setInitialQuestion("");
        }}
        initialQuestion={initialQuestion}
      />

      {/* Interactive Card Modal */}
      <InteractiveCard
        isOpen={isCardOpen}
        onClose={() => setIsCardOpen(false)}
        onAskQuestion={handleAskQuestion}
      />
    </>
  );
};

export default HeroSection;
