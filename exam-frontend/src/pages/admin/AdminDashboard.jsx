import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:5000/api/subjects', {
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok) {
                    if (res.status === 401) navigate('/login');
                    throw new Error('Unauthorized');
                }
                return res.json();
            })
            .then(data => {
                const list = Array.isArray(data) ? data : [];
                setSubjects(list);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [navigate]);

    if (loading) return <div className="text-center py-20">Loading dashboard...</div>;

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto p-8">
                <h1 className="text-4xl font-bold mb-10 text-gray-800 text-center">Admin Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <Link to="/admin-subjects" className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-center">
                        <h2 className="text-2xl font-bold mb-4">Manage Subjects</h2>
                        <p className="text-lg opacity-90">Add / Delete exam subjects</p>
                    </Link>

                    <Link to="/admin-submissions" className="bg-gradient-to-br from-green-600 to-teal-700 text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-center">
                        <h2 className="text-2xl font-bold mb-4">View Submissions</h2>
                        <p className="text-lg opacity-90">Check all student answers</p>
                    </Link>

                    <Link to="/admin-submissions-review" className="bg-gradient-to-br from-red-600 to-pink-700 text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-center">
                        <h2 className="text-2xl font-bold mb-4">Review & Score</h2>
                        <p className="text-lg opacity-90">Review pending submissions</p>
                    </Link>

                    {/* <Link to="/admin-questions/mcq" className="bg-gradient-to-br from-orange-600 to-red-700 text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-center">
                        <h2 className="text-2xl font-bold mb-4">Quick Access</h2>
                        <p className="text-lg opacity-90">Jump to MCQ management</p>
                    </Link> */}
                </div>

                {subjects.length > 0 && (
                    <div>
                        <h2 className="text-3xl font-bold mb-8 text-center text-gray-700">Manage Questions by Subject</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {subjects.map((sub) => (
                                <div key={sub.id} className="bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200">
                                    <h3 className="text-2xl font-bold mb-4 text-blue-700 capitalize">
                                        {sub.name.replace(/-/g, ' ')}
                                    </h3>
                                    <div className="flex gap-3">
                                        <Link
                                            to={`/admin-questions/${sub.name}`}
                                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded text-center hover:bg-blue-700 transition"
                                        >
                                            Questions
                                        </Link>
                                        <Link
                                            to={`/admin-papers/${sub.name}`}
                                            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded text-center hover:bg-purple-700 transition"
                                        >
                                            Papers
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;