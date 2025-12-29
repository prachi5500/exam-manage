import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { Link } from 'react-router-dom';

const AdminSubmissions = () => {
    const [submissions, setSubmissions] = useState([]);

    // useEffect(() => {
    //     const stored = JSON.parse(localStorage.getItem('submissions') || '[]');
    //     setSubmissions(stored);
    // }, []);
    useEffect(() => {
    fetch('http://localhost:3000/api/admin/submissions', {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    })
        .then(res => res.json())
        .then(data => setSubmissions(data))
        .catch(err => console.error('Error loading submissions', err));
}, []);


    // const deleteSubmission = (index) => {
    //     if (window.confirm('Are you sure you want to delete this submission?')) {
    //         const updated = submissions.filter((_, i) => i !== index);
    //         localStorage.setItem('submissions', JSON.stringify(updated));
    //         setSubmissions(updated);
    //     }
    // };
const deleteSubmission = async (id) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) return;

    await fetch(`http://localhost:3000/api/admin/submissions/${id}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });

    setSubmissions(prev => prev.filter(sub => sub.id !== id));
};


    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin - Exam Submissions</h1>

                {submissions.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow-md">
                        <p className="text-lg text-gray-600">No submissions yet.</p>
                        <Link to="/admin-dashboard" className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700">
                            Back to Dashboard
                        </Link>
                    </div>
                ) : (
                    submissions.map((sub) => (
                        <div key={sub.id} className="bg-white p-8 rounded-lg shadow-md mb-8">
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-2xl font-semibold">
                                    Submission #{submissions.length - idx} 
                                    <span className="text-blue-600 ml-3">
                                        ({sub.type ? sub.type.toUpperCase() : 'MIXED (Old)'})
                                    </span>
                                </h2>
                                <p className="text-gray-600">
                                    {new Date(sub.timestamp).toLocaleString()}
                                </p>
                            </div>

                            <div className="space-y-6">
                                {sub.answers.map((ans, i) => (
                                    <div key={i} className="p-5 bg-gray-50 rounded-lg border">
                                        <p className="font-medium text-gray-800 mb-2">
                                            Q{i + 1}: {ans.question.question}
                                        </p>
                                        <p className="text-gray-700 whitespace-pre-wrap">
                                            <span className="font-medium">Answer:</span>{' '}
                                            {ans.answer || <em className="text-gray-500">(No answer provided)</em>}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 text-right">
                                <button
                                    onClick={() => deleteSubmission(sub.id)}
                                    className="px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                                >
                                    Delete Submission
                                </button>
                            </div>
                        </div>
                    ))
                )}

                <div className="mt-8 text-center">
                    <Link to="/admin-dashboard" className="px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700">
                        Back to Admin Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminSubmissions;