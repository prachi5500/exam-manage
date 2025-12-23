import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';

const AdminMCQ = () => {
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);

    useEffect(() => {
        const stored = localStorage.getItem('mcqQuestions');
        if (stored) setQuestions(JSON.parse(stored));
    }, []);

    const saveToStorage = (updated) => {
        localStorage.setItem('mcqQuestions', JSON.stringify(updated));
        setQuestions(updated);
    };

    const addQuestion = () => {
        if (newQuestion.trim() && options.every(opt => opt.trim())) {
            const updated = [...questions, { type: 'mcq',  question: newQuestion, options }];
            saveToStorage(updated);
            setNewQuestion('');
            setOptions(['', '', '', '']);
        }
    };

    const deleteQuestion = (index) => {
        const updated = questions.filter((_, i) => i !== index);
        saveToStorage(updated);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Admin - MCQ Questions</h1>
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-xl font-semibold mb-4">Add New MCQ Question</h2>
                    <input
                        placeholder="Question"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded mb-4"
                    />
                    {options.map((opt, i) => (
                        <input
                            key={i}
                            placeholder={`Option ${i + 1}`}
                            value={opt}
                            onChange={(e) => {
                                const newOpts = [...options];
                                newOpts[i] = e.target.value;
                                setOptions(newOpts);
                            }}
                            className="w-full p-2 border border-gray-300 rounded mb-2"
                        />
                    ))}
                    <button onClick={addQuestion} className="px-4 py-2 bg-blue-500 text-white rounded">
                        Add Question
                    </button>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Existing Questions</h2>
                    {questions.map((q, i) => (
                        <div key={i} className="mb-4 p-4 border border-gray-200 rounded">
                            <p className="font-semibold">{q.question}</p>
                            <ul className="list-disc list-inside">
                                {q.options.map((opt, j) => <li key={j}>{opt}</li>)}
                            </ul>
                            <button onClick={() => deleteQuestion(i)} className="mt-2 px-3 py-1 bg-red-500 text-white rounded">
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminMCQ;
