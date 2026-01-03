import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

const Results = () => {
  const [submissions, setSubmissions] = useState([]);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:5000/api/submissions/student-submissions", {
        credentials: "include"
      }),
      fetch("http://localhost:5000/api/results/my-results", {
        credentials: "include"
      })
    ])
      .then(async ([subRes, resRes]) => {
        if (!subRes.ok || !resRes.ok) {
          throw new Error("Failed to fetch data");
        }
        return Promise.all([subRes.json(), resRes.json()]);
      })
      .then(([subData, resData]) => {
        const submissionList = Array.isArray(subData) ? subData : [];
        const resultList = Array.isArray(resData) ? resData : [];
        const resultMap = {};
        resultList.forEach(r => {
          resultMap[r.submissionId] = r;
        });
        setSubmissions(submissionList.reverse());
        setResults(resultMap);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading", err);
        setSubmissions([]);
        setResults({});
        setLoading(false);
      });
  }, []);

  const getResultStatus = (submission) => {
    const result = results[submission.submissionId];
    if (result) {
      return { status: "approved", score: result.score, feedback: result.feedback };
    }
    return { status: "pending", score: null };
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8">Results</h1>
        {submissions.length === 0 ? (
          <p>No submissions</p>
        ) : (
          <div className="grid gap-6">
            {submissions.map((sub) => (
              <div key={sub.submissionId} className="bg-white p-6 rounded">
                <h2 className="text-2xl mb-2">{sub.subject}</h2>
                <p className="text-gray-600 mb-4">Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                {(() => {
                  const st = getResultStatus(sub);
                  return st.status === "pending" ? (
                    <p className="text-blue-600">Pending Review</p>
                  ) : (
                    <div>
                      <p className="text-green-600">Score: {st.score}</p>
                      {st.feedback && <p>{st.feedback}</p>}
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>
        )}
        <div className="mt-12">
          <Link to="/exam-selection" className="px-8 py-4 bg-blue-600 text-white rounded mr-4">
            Take Another Exam
          </Link>
          <Link to="/home" className="px-8 py-4 bg-gray-600 text-white rounded">
            Back
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Results;
