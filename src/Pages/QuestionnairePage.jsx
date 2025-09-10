import React, { useEffect, useState } from "react";
import API from "../api/api.js";
import { useNavigate } from "react-router-dom";

const Questionnaire = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchQuestions = async () => {
      const res = await API.get("/questions");
      setQuestions(res.data);
    };
    fetchQuestions();
  }, []);

  const handleChange = (qId, value) => {
    setAnswers({ ...answers, [qId]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const answerArray = questions.map((q) => ({
      question: q.text,
      answer: answers[q._id] || "",
    }));

    const res = await API.post("/responses", { userId, answers: answerArray });
    localStorage.setItem("results", JSON.stringify(res.data));
    navigate("/results");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Questionnaire</h2>
      <form onSubmit={handleSubmit}>
        {questions.map((q) => (
          <div key={q._id}>
            <p>{q.text}</p>
            <input
              type="text"
              value={answers[q._id] || ""}
              onChange={(e) => handleChange(q._id, e.target.value)}
              required
            />
            <br />
            <br />
          </div>
        ))}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Questionnaire;
