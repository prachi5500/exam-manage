import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { Link } from 'react-router-dom';

const AdminSubjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [newSubject, setNewSubject] = useState('');

    // useEffect(() => {
    //     const stored = localStorage.getItem('examSubjects');
    //     if (stored) {
    //         setSubjects(JSON.parse(stored));
    //     } else {
    //         // Default subjects
    //         setSubjects(['mcq', 'theory', 'coding']);
    //         localStorage.setItem('examSubjects', JSON.stringify(['mcq', 'theory', 'coding']));
    //     }
    // }, []);

    useEffect(() => {
        fetch('http://localhost:3000/api/subjects', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => res.json())
            .then(data => {
                setSubjects(data);   // expected: [{ id, name }]
                setLoading(false);
            })
            .catch(err => {
                console.error('Error loading subjects', err);
                setLoading(false);
            });
    }, []);


    // const addSubject = () => {
    //     const name = newSubject.trim().toLowerCase().replace(/\s+/g, '-');
    //     if (name && !subjects.includes(name)) {
    //         const updated = [...subjects, name];
    //         setSubjects(updated);
    //         localStorage.setItem('examSubjects', JSON.stringify(updated));
    //         setNewSubject('');
    //     }
    // };

    // const deleteSubject = (index) => {
    //     if (window.confirm('Delete this subject? Questions will remain but inaccessible until re-added.')) {
    //         const updated = subjects.filter((_, i) => i !== index);
    //         setSubjects(updated);
    //         localStorage.setItem('examSubjects', JSON.stringify(updated));
    //     }
    // };
    // ✅ 2. ADD SUBJECT (API CALL)
    const addSubject = async () => {
        const name = newSubject.trim().toLowerCase().replace(/\s+/g, '-');
        if (!name) return;

        const res = await fetch('http://localhost:3000/api/subjects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ name })
        });

        const saved = await res.json();
        setSubjects(prev => [...prev, saved]);
        setNewSubject('');
    };

    // ✅ 3. DELETE SUBJECT (API CALL)
    const deleteSubject = async (id) => {
        if (!window.confirm('Delete this subject?')) return;

        await fetch(`http://localhost:3000/api/subjects/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        setSubjects(prev => prev.filter(sub => sub.id !== id));
    };


    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto p-8 max-w-4xl">
                <h1 className="text-3xl font-bold mb-8">Manage Exam Subjects</h1>

                <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                    <h2 className="text-2xl font-semibold mb-6">Add New Subject</h2>
                    <div className="flex gap-4">
                        <input
                            value={newSubject}
                            onChange={(e) => setNewSubject(e.target.value)}
                            placeholder="e.g., JavaScript, Physics, React"
                            className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:border-blue-500"
                        />
                        <button onClick={addSubject} className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Add
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-semibold mb-6">Current Subjects</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {subjects.map((sub, i) => (
                            <div key={i} className="flex justify-between items-center bg-gray-50 p-5 rounded-lg">
                                <span className="font-medium capitalize">{sub.replace(/-/g, ' ')}</span>
                                <button
                                    onClick={() => deleteSubject(i)}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <Link to="/admin-dashboard" className="mt-8 inline-block px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
};

export default AdminSubjects;