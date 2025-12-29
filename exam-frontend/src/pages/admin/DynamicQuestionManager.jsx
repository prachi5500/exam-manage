import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const DynamicQuestionManager = () => {
    const { subject } = useParams();
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [options, setOptions] = useState(['', '', '', '']); // for MCQ only

    const storageKey = `${subject}Questions`;

   // ✅ Load questions from backend
    useEffect(() => {
        fetch(`http://localhost:3000/api/questions?subject=${subject}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => res.json())
            .then(data => {
                setQuestions(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [subject]);

    // const addQuestion = () => {
    //     if (!newQuestion.trim()) return;

    //     let questionObj = { question: newQuestion.trim() };

    //     // Simple detection: if subject contains "mcq" or we assume MCQ if options filled
    //     if (subject.includes('mcq') || options.some(o => o.trim())) {
    //         questionObj = { ...questionObj, options: options.filter(o => o.trim()), type: 'mcq' };
    //     }

    //     const updated = [...questions, questionObj];
    //     saveQuestions(updated);
    //     setNewQuestion('');
    //     setOptions(['', '', '', '']);
    // };
       // ✅ Add question
    const addQuestion = async () => {
        if (!newQuestion.trim()) return;

        const payload = {
            subject,
            question: newQuestion,
            type: subject.includes('mcq') ? 'mcq' : 'text',
            options: subject.includes('mcq')
                ? options.filter(o => o.trim())
                : []
        };

        const res = await fetch('http://localhost:3000/api/questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(payload)
        });

        const saved = await res.json();
        setQuestions(prev => [...prev, saved]);
        setNewQuestion('');
        setOptions(['', '', '', '']);
    };

    // const deleteQuestion = (index) => {
    //     const updated = questions.filter((_, i) => i !== index);
    //     saveQuestions(updated);
    // };
     const deleteQuestion = async (id) => {
        await fetch(`http://localhost:3000/api/questions/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        setQuestions(prev => prev.filter(q => q.id !== id));
    };


    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto p-8 max-w-4xl">
                <h1 className="text-3xl font-bold mb-8">Manage Questions: {subject.replace(/-/g, ' ')}</h1>

                <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                    <h2 className="text-2xl font-semibold mb-6">Add New Question</h2>
                    <textarea
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="Enter question text"
                        rows="4"
                        className="w-full p-4 border rounded-lg mb-4"
                    />

                    {subject.includes('mcq') && (
                        <div className="mb-4">
                            <p className="font-medium mb-2">Options (for MCQ):</p>
                            {options.map((opt, i) => (
                                <input
                                    key={i}
                                    value={opt}
                                    onChange={(e) => {
                                        const newOpts = [...options];
                                        newOpts[i] = e.target.value;
                                        setOptions(newOpts);
                                    }}
                                    placeholder={`Option ${i+1}`}
                                    className="w-full p-3 border rounded mb-2"
                                />
                            ))}
                        </div>
                    )}

                    <button onClick={addQuestion} className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        Add Question
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-semibold mb-6">Existing Questions ({questions.length})</h2>
                    {questions.map((q, i) => (
                        <div key={i} className="p-6 bg-gray-50 rounded-lg mb-4 flex justify-between items-start">
                            <div>
                                <p className="font-medium">{q.question}</p>
                                {q.options && (
                                    <ul className="list-disc ml-6 mt-2">
                                        {q.options.map((opt, j) => <li key={j}>{opt}</li>)}
                                    </ul>
                                )}
                            </div>
                            <button onClick={() => deleteQuestion(i)} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                                Delete
                            </button>
                        </div>
                    ))}
                </div>

                <Link to="/admin-dashboard" className="mt-8 inline-block px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
};

export default DynamicQuestionManager;