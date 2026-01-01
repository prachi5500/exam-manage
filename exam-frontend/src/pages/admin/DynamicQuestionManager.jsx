// frontend/pages/admin/DynamicQuestionManager.jsx (Updated for multi-type support)
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const DynamicQuestionManager = () => {
    const { subject } = useParams();
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [selectedType, setSelectedType] = useState('mcq');
    const [options, setOptions] = useState(['', '', '', '']);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [initialCode, setInitialCode] = useState('');

    useEffect(() => {
        fetch(`http://localhost:5000/api/questions?subject=${subject}`, {
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok && res.status === 401) navigate('/login');
                return res.json();
            })
            .then(data => {
                setQuestions(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [subject, navigate]);

    const addQuestion = async () => {
        if (!newQuestion.trim()) return;
        if (selectedType === 'mcq' && options.some(o => !o.trim())) {
            alert('All options required for MCQ');
            return;
        }

        try {
            const body = {
                subject,
                type: selectedType,
                question: newQuestion.trim(),
                options: selectedType === 'mcq' ? options : undefined,
                initialCode: selectedType === 'coding' ? initialCode : undefined,  // Add snippet
            };
            if (selectedType === 'mcq') {
                body.options = options.map(o => o.trim());
            }

            const res = await fetch('http://localhost:5000/api/questions', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                const added = await res.json();
                setQuestions([...questions, added]);
                setNewQuestion('');
                setOptions(['', '', '', '']);
                setSelectedType('mcq'); // Reset to default
            } else {
                alert('Failed to add question');
            }
        } catch (err) {
            alert('Error adding question');
        }
    };

    const deleteQuestion = async (id) => {
        if (!window.confirm('Delete this question?')) return;
        try {
            await fetch(`http://localhost:5000/api/questions/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            setQuestions(questions.filter(q => q.id !== id));
        } catch (err) {
            alert('Failed to delete');
        }
    };

    if (loading) return <div className="text-center py-20">Loading questions...</div>;

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto p-8">
                <h1 className="text-4xl font-bold mb-8 text-center capitalize">
                    Manage {subject.replace(/-/g, ' ')} Questions
                </h1>

                <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg mb-12">
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">Question Type</label>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="w-full p-3 border rounded-lg"
                        >
                            <option value="mcq">MCQ</option>
                            <option value="theory">Theory</option>
                            <option value="coding">Coding</option>
                        </select>
                    </div>

                    <textarea
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="Enter question text"
                        rows={selectedType === 'mcq' ? 3 : 6}
                        className="w-full p-4 border rounded-lg mb-6"
                    />

                    {selectedType === 'mcq' && (
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {options.map((opt, i) => (
                                <div key={i}>
                                    <label className="block text-sm font-medium mb-1">Option {i + 1}</label>
                                    <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => {
                                            const newOpts = [...options];
                                            newOpts[i] = e.target.value;
                                            setOptions(newOpts);
                                        }}
                                        className="w-full p-3 border rounded"
                                        placeholder={`Enter option ${i + 1}`}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {selectedType === 'coding' && (
                        <textarea value={initialCode} onChange={(e) => setInitialCode(e.target.value)} placeholder="Initial code snippet (optional)" rows="5" className="w-full p-3 border rounded mb-4" />
                    )}

                    <button
                        onClick={addQuestion}
                        className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Add Question
                    </button>
                </div>

                <div className="grid gap-6 max-w-4xl mx-auto">
                    {questions.map((q) => (
                        <div key={q.id} className="bg-white p-6 rounded-xl shadow-md">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-2">
                                        Type: {q.type.toUpperCase()}
                                    </span>
                                    <p className="text-lg font-medium">{q.question}</p>
                                </div>
                                <button
                                    onClick={() => deleteQuestion(q.id)}
                                    className="px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>

                            {q.options && (
                                <div className="mt-4">
                                    <h4 className="font-medium mb-2">Options:</h4>
                                    <ul className="list-disc ml-6 space-y-1">
                                        {q.options.map((opt, i) => (
                                            <li key={i}>{opt}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Link to="/admin-dashboard" className="px-8 py-4 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition">
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DynamicQuestionManager;