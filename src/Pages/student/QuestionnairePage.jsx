import React, { useEffect, useState } from "react";
import API from "../../api/api.js";
import Student_sidebar from "../../Components/sidebar/Student_sidebar.jsx";

const QuestionnairePage = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [finalFeeling, setFinalFeeling] = useState("");
  const [submissionResult, setSubmissionResult] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  const colors = {
    primary: "#C4B5FD", 
    secondary: "#38BDF8",
    ternary: "#FECACA", 
    primaryDark: "#10B981",
    secondaryDark: "#0EA5E9",
    lightBg: "#F8FAFC"
  };

  useEffect(() => {
    setQuestions([
      { _id: "q1", text: "How are you feeling emotionally today?", options: ["😞 Very low", "🙁 Low", "😐 Neutral", "🙂 Good", "😃 Very good"] },
      { _id: "q2", text: "How motivated do you feel to study/work?", options: ["😴 Not at all", "😕 A little", "😐 Neutral", "💪 Motivated", "🔥 Very motivated"] },
      { _id: "q3", text: "How well did you sleep last night?", options: ["😵 Very poorly", "🥱 Poorly", "😐 Average", "😊 Well", "😴 Very well"] },
      { _id: "q4", text: "Do you feel connected with others?", options: ["🚫 Very disconnected", "🙁 Disconnected", "😐 Neutral", "🤝 Connected", "❤️ Very connected"] },
      { _id: "q5", text: "How much stress are you experiencing?", options: ["😰 Very high", "😟 High", "😐 Moderate", "🙂 Low", "😌 Very low"] },
    ]);
  }, []);

  const handleChange = (qId, value) => {
    setAnswers({ ...answers, [qId]: value });
  };

  const handleNext = () => currentStep < questions.length && setCurrentStep(currentStep + 1);
  const handlePrev = () => currentStep > 0 && setCurrentStep(currentStep - 1);

  const handleResourceClick = (resource) => {
    if (resource.link) {
      // Check if link has protocol, add if missing
      const fullLink = resource.link.startsWith('http') 
        ? resource.link 
        : `https://${resource.link}`;
      
      window.open(fullLink, '_blank', 'noopener,noreferrer');
    } else {
      console.warn('No link available for resource:', resource.title);
      alert(`No link available for: ${resource.title}`);
    }
  };

  const handleSubmit = async () => {
    for (const q of questions) if (!answers[q._id]) return alert(`Please answer: ${q.text}`);
    if (!finalFeeling) return alert("Please enter your overall feeling.");

    const negativeOptions = ["Very low","Low","Not at all","A little","Very poorly","Poorly","Very disconnected","Disconnected","Very high","High"];
    const answerArray = questions.map(q => ({
      question: q.text,
      answer: answers[q._id],
      isNegative: negativeOptions.some(key => answers[q._id].includes(key)),
    }));
    answerArray.push({ question: "Overall feeling", answer: finalFeeling, isNegative: false });

    try {
      const res = await API.post("/responses", { studentId: user._id, answers: answerArray });
      setSubmissionResult(res.data);
      localStorage.setItem("results", JSON.stringify(res.data));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      alert("Failed to submit responses.");
    }
  };

  // Debug resources when submission result changes
  useEffect(() => {
    if (submissionResult?.recommendedResources) {
      console.log("Recommended Resources:", submissionResult.recommendedResources);
      submissionResult.recommendedResources.forEach((resource, index) => {
        console.log(`Resource ${index + 1}:`, {
          title: resource.title,
          link: resource.link,
          hasLink: !!resource.link,
          linkType: typeof resource.link
        });
      });
    }
  }, [submissionResult]);

  return (
    <div className="h-screen flex overflow-hidden" >
      <Student_sidebar />
      <div className="flex-1 flex flex-col p-6 sm:p-10 h-full overflow-auto">
        {/* Header */}
        <div 
          className="rounded-2xl text-black bg-sky-300 p-8 mb-8 shadow-lg"
       
        >
          <h1 className="text-3xl font-bold">Hi {user?.name || "Student"}, let's check in</h1>
          <p className="mt-2 text-lg opacity-90">Answer honestly to get the best guidance.</p>
        </div>

        {!submissionResult ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3 text-black font-medium">
                <span>Question {Math.min(currentStep + 1, questions.length + 1)} of {questions.length + 1}</span>
                <span>{Math.round(((currentStep + 1) / (questions.length + 1)) * 100)}% Complete</span>
              </div>
              <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-2.5 rounded-full transition-all duration-300 bg-sky-300"
                  style={{ 
                    width: `${((currentStep + 1) / (questions.length + 1)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Question Card - Fixed height container */}
            <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col border border-gray-100 w-full max-w-4xl mx-auto flex-1 min-h-0">
              {/* Content Area - Fixed height with scroll if needed */}
              <div className="flex-1 overflow-y-auto mb-8">
                {currentStep < questions.length ? (
                  <div className="flex flex-col h-full">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">{questions[currentStep].text}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                      {questions[currentStep].options.map(opt => (
                        <button 
                          key={opt} 
                          type="button" 
                          onClick={() => handleChange(questions[currentStep]._id, opt)}
                          className={`px-4 py-4 rounded-xl text-base font-medium transition-all border shadow-sm flex flex-col items-center justify-center
                            ${answers[questions[currentStep]._id] === opt 
                              ? "text-white border-transparent shadow-md scale-105" 
                              : "bg-white text-black border-gray-200 hover:bg-gray-50 hover:border-gray-300"}`}
                          style={answers[questions[currentStep]._id] === opt ? {
                            background: `linear-gradient(135deg, ${colors.secondary}, ${colors.secondary})`
                          } : {}}
                        >
                          <span className="text-2xl mb-1">{opt.match(/[^\s]+/)[0]}</span>
                          <span className="text-sm">{opt.replace(/[^\s]+\s/, '')}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">How are you feeling overall?</h2>
                    <div className="flex-1">
                      <textarea 
                        value={finalFeeling} 
                        onChange={e => setFinalFeeling(e.target.value)} 
                        rows={8}
                        placeholder="Type your feelings here..."
                        className="border rounded-lg p-4 w-full h-full min-h-[200px] focus:outline-none transition resize-none"
                        style={{ 
                          borderColor: colors.primary,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Buttons - Fixed at bottom of card */}
              <div className="flex justify-between w-full pt-6 border-t border-gray-200 mt-auto">
                {currentStep > 0 && (
                  <button 
                    onClick={handlePrev}
                    className="px-6 py-3 rounded-lg font-medium transition hover:shadow-md"
                    style={{ 
                      backgroundColor: colors.secondary,
                      color: "white"
                    }}
                  >
                    Previous
                  </button>
                )}
                {currentStep < questions.length ? (
                  <button 
                    onClick={handleNext} 
                    disabled={!answers[questions[currentStep]._id]}
                    className={`ml-auto px-6 py-3 rounded-lg text-white font-medium shadow-md transition ${!answers[questions[currentStep]._id] ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg"}`}
                    style={{ 
                      backgroundColor: colors.secondaryDark
                    }}
                  >
                    Next
                  </button>
                ) : (
                  <button 
                    onClick={handleSubmit} 
                    disabled={!finalFeeling}
                    className={`ml-auto px-6 py-3 rounded-lg text-white font-medium shadow-md transition ${!finalFeeling ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg"}`}
                    style={{ 
                      backgroundColor: colors.secondaryDark
                    }}
                  >
                    Submit Answers
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Display mood + recommended resources
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 flex flex-col w-full max-w-6xl mx-auto h-full">
            {/* Elegant Header */}
            <div className="text-center mb-6">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 rounded-full opacity-20 animate-pulse" 
                     style={{ backgroundColor: colors.primary }}></div>
                <div className="relative w-24 h-24 rounded-full flex items-center justify-center text-4xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-inner">
                  {submissionResult.mood === 'Positive' ? '🌟' : 
                   submissionResult.mood === 'Negative' ? '💫' : '✨'}
                </div>
              </div>
              <h2 className="text-4xl font-light text-gray-800 mb-4">Your Wellness Check</h2>
              <div className="flex justify-center items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-900" style={{ color: colors.secondaryDark }}>
                    {submissionResult.mood}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Mood</div>
                </div>
                <div className="w-px h-8 bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-900">{submissionResult.score}</div>
                  <div className="text-sm text-gray-500 mt-1">Score</div>
                </div>
              </div>
            </div>

            {/* Recommended Resources - Horizontal Layout */}
            {submissionResult.recommendedResources && submissionResult.recommendedResources.length > 0 ? (
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="text-center mb-10">
                  <h3 className="text-2xl font-light text-gray-800 mb-3">Curated Support Resources</h3>
                  <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
                    Personalized recommendations to help you maintain and improve your wellbeing
                  </p>
                </div>

                {/* Horizontal Resources Container */}
                <div className="flex-1 min-h-0">
                  <div className="flex space-x-6 overflow-x-auto pb-4 px-2 -mx-2">
                    {submissionResult.recommendedResources.map((r, index) => (
                      <div
                        key={r._id} 
                        className="group relative flex-shrink-0 w-80 bg-gradient-to-b from-white to-gray-50 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-500 hover:shadow-lg hover:scale-105 cursor-pointer"
                        onClick={() => handleResourceClick(r)}
                      >
                        <div className="p-6 h-full flex flex-col">
                          {/* Number Badge */}
                          <div className="flex-shrink-0 mb-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-medium text-lg shadow-sm transition-all duration-300 group-hover:scale-110"
                                 style={{ 
                                   background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
                                 }}>
                              {index + 1}
                            </div>
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 flex flex-col min-h-0">
                            <h4 className="text-xl font-normal text-gray-800 leading-tight line-clamp-2 mb-3" 
                                style={{ color: colors.secondaryDark }}>
                              {r.title}
                            </h4>
                            <p className="text-gray-600 leading-relaxed text-sm flex-1 overflow-hidden line-clamp-3 mb-4">
                              {r.description}
                            </p>
                            
                            {/* Action Button */}
                            <div className="flex-shrink-0">
                              <div className="inline-flex items-center text-sm font-medium px-4 py-2 rounded-full transition-all duration-300 group-hover:shadow-sm w-full justify-center"
                                    style={{ 
                                      backgroundColor: colors.primary + '15',
                                      color: colors.secondaryDark
                                    }}>
                                <span>{r.link ? "Explore Resource" : "No Link Available"}</span>
                                {r.link && (
                                  <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" 
                                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                  </svg>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Hover Effect Border */}
                        <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-opacity-20 transition-all duration-300"
                             style={{ borderColor: colors.primary }}></div>
                        
                        {/* Show indicator if no link */}
                        {!r.link && (
                          <div className="absolute top-3 right-3 bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                            No Link
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📚</div>
                <h3 className="text-xl font-light text-gray-600 mb-2">No Resources Recommended</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Based on your positive responses, no additional resources are needed at this time. 
                  Keep up the great work!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionnairePage;