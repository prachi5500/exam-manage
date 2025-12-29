// import React, { useState, useEffect } from 'react';
// import Navbar from '../components/Navbar';
// import { Link } from 'react-router-dom';

// const Results = () => {
//     const [submissions, setSubmissions] = useState([]);

//     // useEffect(() => {
//     //     const stored = JSON.parse(localStorage.getItem('submissions') || '[]');
//     //     // Latest first
//     //     setSubmissions(stored.reverse());
//     // }, []);
//     useEffect(() => {
//         fetch('http://localhost:5000/api/student-submissions')
//             .then(res => res.json())
//             .then(data => setSubmissions(data.reverse()));
//     }, []);

//     // Group by subject to count attempts
//     const subjectCounts = submissions.reduce((acc, sub) => {
//         const subj = sub.subject ? sub.subject.replace(/-/g, ' ').toUpperCase() : 'UNKNOWN';
//         acc[subj] = (acc[subj] || 0) + 1;
//         return acc;
//     }, {});

//     return (
//         <div className="min-h-screen bg-gray-100">
//             <Navbar />
//             <div className="container mx-auto p-8 max-w-5xl">
//                 <h1 className="text-4xl font-bold mb-10 text-center text-gray-800">Your Exam Summary</h1>

//                 <div className="bg-white rounded-2xl shadow-xl p-8 mb-10">
//                     <h2 className="text-2xl font-bold mb-6 text-blue-700">Total Exams Attempted: {submissions.length}</h2>

//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                         {Object.entries(subjectCounts).map(([subject, count]) => (
//                             <div key={subject} className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl text-center shadow-md">
//                                 <h3 className="text-xl font-semibold text-blue-800 capitalize">{subject}</h3>
//                                 <p className="text-3xl font-bold text-blue-600 mt-4">{count}</p>
//                                 <p className="text-sm text-gray-600 mt-2">attempt{count > 1 ? 's' : ''}</p>
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 <h2 className="text-2xl font-bold mb-6">Recent Attempts</h2>

//                 {submissions.length === 0 ? (
//                     <div className="text-center py-12 bg-white rounded-xl shadow-lg">
//                         <p className="text-xl text-gray-600">No exams attempted yet.</p>
//                         <Link to="/exam-selection" className="mt-6 inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
//                             Start Your First Exam
//                         </Link>
//                     </div>
//                 ) : (
//                     <div className="space-y-6">
//                         {submissions.map((sub, idx) => (
//                             <div key={idx} className="bg-white p-6 rounded-xl shadow-lg flex justify-between items-center">
//                                 <div>
//                                     <h3 className="text-xl font-semibold capitalize">
//                                         {sub.subject ? sub.subject.replace(/-/g, ' ') : 'Unknown Subject'}
//                                     </h3>
//                                     <p className="text-gray-600 mt-2">
//                                         Attempted on: {new Date(sub.timestamp).toLocaleString()}
//                                     </p>
//                                     <p className="text-sm text-gray-500 mt-1">
//                                         Questions answered: {sub.answers.length}
//                                     </p>
//                                 </div>
//                                 <div className="text-right">
//                                     <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
//                                         Completed
//                                     </span>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 )}

//                 <div className="mt-10 text-center">
//                     <Link to="/" className="px-8 py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
//                         ← Back to Home
//                     </Link>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Results;

import React, { useState, useEffect } from 'react';
import { Award, Clock, Download, Eye, FileText, Filter } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Results = () => {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, published, pending

  useEffect(() => {
    fetchResults();
  }, []);

  useEffect(() => {
    filterResults();
  }, [filter, results]);

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/exams/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setResults(response.data.examHistory);
    } catch (error) {
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const filterResults = () => {
    let filtered = [...results];
    
    if (filter === 'published') {
      filtered = filtered.filter(r => r.status === 'published');
    } else if (filter === 'pending') {
      filtered = filtered.filter(r => r.status === 'submitted');
    }
    
    setFilteredResults(filtered);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Result Published</span>;
      case 'submitted':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Evaluation Pending</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">Submitted</span>;
    }
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGrade = (percentage) => {
    if (percentage >= 80) return 'A+';
    if (percentage >= 70) return 'A';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  };

  const downloadResult = (resultUrl) => {
    if (resultUrl) {
      window.open(resultUrl, '_blank');
    } else {
      toast.error('Result PDF not available');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <Award className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Exam Results</h1>
            <p className="text-lg text-green-100">
              View your exam performance and results
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold text-gray-900">
                {filteredResults.length} {filter === 'all' ? 'Total' : filter} Results
              </h2>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('published')}
                className={`px-4 py-2 rounded-lg ${filter === 'published' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Published
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg ${filter === 'pending' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Pending
              </button>
            </div>
          </div>
        </div>

        {/* Results List */}
        {filteredResults.length > 0 ? (
          <div className="space-y-6">
            {filteredResults.map((result) => {
              const percentage = result.score && result.totalMarks 
                ? ((result.score / result.totalMarks) * 100).toFixed(1)
                : null;

              return (
                <div key={result.submissionId} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{result.examTitle}</h3>
                        <div className="flex items-center mt-2 space-x-3">
                          {getStatusBadge(result.status)}
                          <span className="text-sm text-gray-500">
                            {new Date(result.submittedAt).toLocaleDateString()}
                          </span>
                          <span className="text-sm text-gray-500">
                            {result.examType?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      {result.status === 'published' && percentage && (
                        <div className="mt-4 md:mt-0 text-center">
                          <div className={`text-3xl font-bold ${getGradeColor(parseFloat(percentage))}`}>
                            {percentage}%
                          </div>
                          <div className="text-sm text-gray-600">Grade: {getGrade(parseFloat(percentage))}</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500 mb-1">Score</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {result.score !== null ? `${result.score}/${result.totalMarks}` : '--'}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500 mb-1">Time Spent</div>
                        <div className="text-lg font-bold text-gray-900">
                          {result.timeSpent ? `${Math.floor(result.timeSpent / 60)}m ${result.timeSpent % 60}s` : '--'}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500 mb-1">Submission ID</div>
                        <div className="text-sm font-mono text-gray-700 truncate">
                          {result.submissionId}
                        </div>
                      </div>
                    </div>
                    
                    {result.remarks && result.status === 'published' && (
                      <div className="mb-6">
                        <h4 className="font-bold text-gray-900 mb-2">Remarks:</h4>
                        <p className="text-gray-700 bg-blue-50 p-4 rounded-lg">{result.remarks}</p>
                      </div>
                    )}
                    
                    <div className="flex justify-end space-x-3">
                      {result.status === 'published' && (
                        <>
                          <button
                            onClick={() => downloadResult(result.resultUrl)}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Result
                          </button>
                          {result.resultUrl && (
                            <button
                              onClick={() => window.open(result.resultUrl, '_blank')}
                              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View PDF
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">No results found</h3>
            <p className="text-gray-500">
              {filter !== 'all' 
                ? `No ${filter} results available` 
                : 'You have not attempted any exams yet'}
            </p>
          </div>
        )}

        {/* Summary Stats */}
        {filteredResults.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-green-600">
                  {filteredResults.filter(r => r.status === 'published').length}
                </div>
                <div className="text-sm text-gray-600">Results Published</div>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {filteredResults.filter(r => r.status === 'submitted').length}
                </div>
                <div className="text-sm text-gray-600">Pending Evaluation</div>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredResults.length}
                </div>
                <div className="text-sm text-gray-600">Total Attempts</div>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {filteredResults.filter(r => r.status === 'published').length > 0
                    ? filteredResults
                        .filter(r => r.status === 'published')
                        .reduce((acc, r) => {
                          const percentage = r.score && r.totalMarks ? (r.score / r.totalMarks) * 100 : 0;
                          return acc + percentage;
                        }, 0) / filteredResults.filter(r => r.status === 'published').length
                    : 0
                  }%
                </div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;