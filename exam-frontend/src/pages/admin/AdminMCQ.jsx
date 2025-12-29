import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';

const AdminMCQ = () => {
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);

    useEffect(() => {
  // ✅ LOCALSTORAGE KI JAGAH BACKEND SE DATA FETCH KARO
  fetch(`http://localhost:3000/api/questions/mcq`)
    .then(res => res.json())
    .then(data => setQuestions(data))
    .catch(err => console.error('Error loading questions:', err));
}, []);

    const addQuestion = () => {
        if (newQuestion.trim() && options.every(opt => opt.trim())) {
            const updated = [...questions, { type: 'mcq',  question: newQuestion, options }];
           const addQuestion = async () => {
    const res = await fetch("http://localhost:3000/api/questions/mcq", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
            question: newQuestion,
            options,
            type: "mcq"
        })
    });

    const saved = await res.json();
    setQuestions(prev => [...prev, saved]);
};

            setNewQuestion('');
            setOptions(['', '', '', '']);
        }
    };

    const deleteQuestion = (index) => {
        const updated = questions.filter((_, i) => i !== index);
        const deleteQuestion = async (id) => {
    await fetch(`http://localhost:3000/api/questions/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    });

    setQuestions(prev => prev.filter(q => q.id !== id));
};

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
