import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';

const AdminMCQ = () => {
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:5000/api/questions?subject=mcq', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
            .then(res => res.json())
            .then(data => {
                setQuestions(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const addQuestion = async () => {
        if (!newQuestion.trim() || options.some(opt => !opt.trim())) return;
        try {
            const res = await fetch('http://localhost:5000/api/questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    subject: 'mcq',
                    type: 'mcq',
                    question: newQuestion.trim(),
                    options: options.map(opt => opt.trim())
                })
            });
            if (res.ok) {
                const added = await res.json();
                setQuestions([...questions, added]);
                setNewQuestion('');
                setOptions(['', '', '', '']);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const deleteQuestion = async (id) => {
        if (!window.confirm('Delete this question?')) return;
        try {
            await fetch(`http://localhost:5000/api/questions/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setQuestions(questions.filter(q => q.id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="text-center py-12">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto p-8">
                <h1 className="text-4xl font-bold mb-8 text-center">Manage MCQ Questions</h1>

                <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md mb-12">
                    <input
                        type="text"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="Enter question"
                        className="w-full p-3 border rounded mb-4"
                    />
                    {options.map((opt, i) => (
                        <input
                            key={i}
                            type="text"
                            value={opt}
                            onChange={(e) => {
                                const newOpts = [...options];
                                newOpts[i] = e.target.value;
                                setOptions(newOpts);
                            }}
                            placeholder={`Option ${i + 1}`}
                            className="w-full p-3 border rounded mb-2"
                        />
                    ))}
                    <button onClick={addQuestion} className="w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Add MCQ Question
                    </button>
                </div>

                <div className="grid gap-6">
                    {questions.map((q) => (
                        <div key={q.id} className="bg-white p-6 rounded-lg shadow-md">
                            <p className="font-semibold mb-2">{q.question}</p>
                            <ul className="list-disc ml-6">
                                {q.options?.map((opt, i) => <li key={i}>{opt}</li>)}
                            </ul>
                            <button onClick={() => deleteQuestion(q.id)} className="mt-4 px-4 py-2 bg-red-600 text-white rounded">
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