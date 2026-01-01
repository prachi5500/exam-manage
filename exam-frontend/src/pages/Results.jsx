import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

const Results = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/submissions/student-submissions', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include' // ← Add this too!
    })
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(data => {
        // Ensure data is an array
        const submissions = Array.isArray(data) ? data : [];
        setSubmissions(submissions.reverse());
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading submissions', err);
        setSubmissions([]);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center py-12">Loading results...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Your Exam Results</h1>

        {submissions.length === 0 ? (
          <p className="text-center text-gray-600">No submissions yet. Take an exam first!</p>
        ) : (
          <div className="grid gap-6">
            {submissions.map((sub) => (
              <div key={sub.submissionId} className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-2 capitalize">
                  {sub.subject?.replace(/-/g, ' ') || 'Unknown Subject'}
                </h2>
                <p className="text-gray-600 mb-4">
                  Submitted on: {new Date(sub.submittedAt).toLocaleString()}
                </p>
                <div className="border-t pt-4">
                  <p className="font-medium mb-2">Your Answers:</p>
                  {Object.entries(sub.answers || {}).map(([qId, ans]) => (
                    <div key={qId} className="mb-3">
                      <p className="font-medium text-sm">Question {qId}:</p>
                      <p className="ml-4 text-gray-700">
                        {typeof ans === 'object' ? JSON.stringify(ans) : ans || <em>(No answer)</em>}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link to="/exam-selection" className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-4">
            Take Another Exam
          </Link>
          <Link to="/home" className="px-8 py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Results;