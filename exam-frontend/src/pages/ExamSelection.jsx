import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const ExamSelection = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:5000/api/subjects', {
            credentials: 'include' // Critical for sending cookie
        })
            .then(res => {
                if (!res.ok) {
                    if (res.status === 401) {
                        navigate('/login');
                        return;
                    }
                    throw new Error('Failed to load subjects');
                }
                return res.json();
            })
            .then(data => {
                const subjectList = Array.isArray(data) ? data : [];
                setSubjects(subjectList);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching subjects:', err);
                setError('Failed to load subjects. Please try again.');
                setLoading(false);
            });
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-xl">Loading subjects...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto p-8 text-center">
                <h1 className="text-4xl font-bold mb-8 text-gray-800">Choose Exam Subject</h1>
                <p className="text-lg text-gray-600 mb-12">Select a subject to start your exam</p>

                {error && <p className="text-red-600 mb-6">{error}</p>}

                {subjects.length === 0 ? (
                    <p className="text-gray-600 text-xl">No subjects available at the moment.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {subjects.map((sub) => (
                            <Link
                                key={sub.id}
                                to={`/exam/${sub.name}`}
                                className="bg-gradient-to-br from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white p-12 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                            >
                                <h2 className="text-3xl font-bold mb-4 capitalize">
                                    {sub.name.replace(/-/g, ' ')}
                                </h2>
                                <p className="text-lg opacity-90">Start Exam →</p>
                            </Link>
                        ))}
                    </div>
                )}

                <div className="mt-12">
                    <Link to="/home" className="px-8 py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ExamSelection;