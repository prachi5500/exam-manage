import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { Link, useNavigate } from 'react-router-dom';

const AdminSubjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [newSubject, setNewSubject] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:5000/api/subjects', {
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok && res.status === 401) navigate('/login');
                return res.json();
            })
            .then(data => {
                setSubjects(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [navigate]);

    const addSubject = async () => {
        if (!newSubject.trim()) return;
        try {
            const res = await fetch('http://localhost:5000/api/subjects', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newSubject.trim().toLowerCase().replace(/\s+/g, '-') })
            });
            if (res.ok) {
                const added = await res.json();
                setSubjects([...subjects, added]);
                setNewSubject('');
            } else {
                alert('Failed to add subject');
            }
        } catch (err) {
            alert('Error adding subject');
        }
    };

    const deleteSubject = async (id) => {
        if (!window.confirm('Delete this subject? All related questions will be lost.')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/subjects/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                setSubjects(subjects.filter(s => s.id !== id));
            }
        } catch (err) {
            alert('Error deleting subject');
        }
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto p-8">
                <h1 className="text-4xl font-bold mb-8 text-center">Manage Exam Subjects</h1>

                <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg mb-12">
                    <input
                        type="text"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        placeholder="e.g., React JS"
                        className="w-full p-4 border rounded-lg mb-4"
                    />
                    <button onClick={addSubject} className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Add New Subject
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {subjects.map((sub) => (
                        <div key={sub.id} className="bg-white p-6 rounded-xl shadow-md flex justify-between items-center">
                            <span className="text-xl font-semibold capitalize">{sub.name.replace(/-/g, ' ')}</span>
                            <button
                                onClick={() => deleteSubject(sub.id)}
                                className="px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Link to="/admin-dashboard" className="px-8 py-4 bg-gray-700 text-white rounded-lg hover:bg-gray-800">
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminSubjects;