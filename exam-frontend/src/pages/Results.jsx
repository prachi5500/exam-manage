import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

const Results = () => {
    const [submissions, setSubmissions] = useState([]);

    // useEffect(() => {
    //     const stored = JSON.parse(localStorage.getItem('submissions') || '[]');
    //     // Latest first
    //     setSubmissions(stored.reverse());
    // }, []);
    useEffect(() => {
        fetch('http://localhost:5000/api/student-submissions')
            .then(res => res.json())
            .then(data => setSubmissions(data.reverse()));
    }, []);

    // Group by subject to count attempts
    const subjectCounts = submissions.reduce((acc, sub) => {
        const subj = sub.subject ? sub.subject.replace(/-/g, ' ').toUpperCase() : 'UNKNOWN';
        acc[subj] = (acc[subj] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto p-8 max-w-5xl">
                <h1 className="text-4xl font-bold mb-10 text-center text-gray-800">Your Exam Summary</h1>

                <div className="bg-white rounded-2xl shadow-xl p-8 mb-10">
                    <h2 className="text-2xl font-bold mb-6 text-blue-700">Total Exams Attempted: {submissions.length}</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {Object.entries(subjectCounts).map(([subject, count]) => (
                            <div key={subject} className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl text-center shadow-md">
                                <h3 className="text-xl font-semibold text-blue-800 capitalize">{subject}</h3>
                                <p className="text-3xl font-bold text-blue-600 mt-4">{count}</p>
                                <p className="text-sm text-gray-600 mt-2">attempt{count > 1 ? 's' : ''}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-6">Recent Attempts</h2>

                {submissions.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                        <p className="text-xl text-gray-600">No exams attempted yet.</p>
                        <Link to="/exam-selection" className="mt-6 inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Start Your First Exam
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {submissions.map((sub, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-xl shadow-lg flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-semibold capitalize">
                                        {sub.subject ? sub.subject.replace(/-/g, ' ') : 'Unknown Subject'}
                                    </h3>
                                    <p className="text-gray-600 mt-2">
                                        Attempted on: {new Date(sub.timestamp).toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Questions answered: {sub.answers.length}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                        Completed
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-10 text-center">
                    <Link to="/" className="px-8 py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Results;