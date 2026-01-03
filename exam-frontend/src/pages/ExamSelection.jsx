import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const ExamSelection = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/subjects', {
                    credentials: 'include'  // Cookie bhejna zaroori hai
                });

                if (!res.ok) {
                    if (res.status === 401) {
                        toast.error('Please login again');
                        navigate('/login');
                        return;
                    }
                    throw new Error('Failed to fetch subjects');
                }

                const data = await res.json();
                console.log("Fetched subjects:", data); // Debug ke liye

                if (data.length === 0) {
                    toast.info('No subjects available yet. Ask admin to add some.');
                }

                setSubjects(data);
            } catch (err) {
                console.error(err);
                toast.error('Error loading subjects');
            } finally {
                setLoading(false);
            }
        };

        fetchSubjects();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <Loader text="Loading subjects..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            <Navbar />
            <div className="container mx-auto p-8 max-w-6xl">
                <h1 className="text-4xl font-bold mb-12 text-center text-gray-800">
                    Select Your Exam Subject
                </h1>

                {subjects.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-2xl text-gray-600 mb-8">
                            No subjects available at the moment.
                        </p>
                        <p className="text-lg text-gray-500">
                            Please contact your admin to add subjects and question papers.
                        </p>
                        <Link
                            to="/home"
                            className="mt-8 inline-block px-8 py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                            ← Back to Home
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {subjects.map((sub) => (
                            <Link
                                key={sub.id}
                                to={`/exam/${sub.name.toLowerCase().trim()}`}
                                className="bg-gradient-to-br from-blue-600 to-purple-700 p-12 rounded-2xl shadow-xl text-white text-center hover:from-blue-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105"
                            >
                                <h2 className="text-3xl font-bold mb-4 capitalize">
                                    {sub.name.replace(/-/g, ' ').trim()}
                                </h2>
                                <p className="text-lg opacity-90">Click to Start Exam →</p>
                            </Link>
                        ))}
                    </div>
                )}

                <div className="mt-12 text-center">
                    <Link
                        to="/home"
                        className="px-8 py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ExamSelection;