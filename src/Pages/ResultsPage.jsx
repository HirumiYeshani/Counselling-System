import React from "react";

const Results = () => {
  const results = JSON.parse(localStorage.getItem("results"));

  if (!results) return <p>No results found.</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Results</h2>
      <p>
        <strong>Status:</strong> {results.response.status}
      </p>
      <p>
        <strong>Sentiment Score:</strong> {results.response.sentimentScore}
      </p>
      <h3>Recommended Resources:</h3>
      <ul>
        {results.resources.map((r) => (
          <li key={r._id}>
            <a href={r.link} target="_blank" rel="noreferrer">
              {r.title}
            </a>{" "}
            - {r.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Results;
