import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const ExamSelection = () => {
    const [subjects, setSubjects] = useState([]);

    // useEffect(() => {
    //     const stored = localStorage.getItem('examSubjects');
    //     if (stored) {
    //         setSubjects(JSON.parse(stored));
    //     } else {
    //         setSubjects(['mcq', 'theory', 'coding']);
    //     }
    // }, []);
    useEffect(() => {
  fetch('http://localhost:5000/api/subjects')
    .then(res => res.json())
    .then(data => setSubjects(data))
    .catch(() => setSubjects(['mcq', 'theory', 'coding'])); // fallback
}, []);

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto p-8 text-center">
                <h1 className="text-4xl font-bold mb-8">Choose Exam Subject</h1>
                <p className="text-lg text-gray-600 mb-12">Select a subject to start the exam</p>

                {subjects.length === 0 ? (
                    <p className="text-xl text-gray-500">No subjects available. Ask admin to add subjects.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {subjects.map((subject) => (
                            <Link
                                key={subject}
                                to={`/exam/${subject}`}
                                className="bg-gradient-to-br from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white p-12 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300"
                            >
                                <h2 className="text-3xl font-bold mb-4 capitalize">
                                    {subject.replace(/-/g, ' ')}
                                </h2>
                                <p className="text-lg opacity-90">Start {subject.replace(/-/g, ' ')} Exam →</p>
                            </Link>
                        ))}
                    </div>
                )}

                <div className="mt-12">
                    <Link to="/" className="px-8 py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ExamSelection;