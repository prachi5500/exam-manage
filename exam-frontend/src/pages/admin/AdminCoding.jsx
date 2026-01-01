import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';

const AdminCoding = () => {
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:5000/api/questions?subject=coding', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
            .then(res => res.json())
            .then(data => {
                setQuestions(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const addQuestion = async () => {
        if (!newQuestion.trim()) return;
        try {
            const res = await fetch('http://localhost:5000/api/questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    subject: 'coding',
                    type: 'coding',
                    question: newQuestion.trim()
                })
            });
            if (res.ok) {
                const added = await res.json();
                setQuestions([...questions, added]);
                setNewQuestion('');
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
                <h1 className="text-4xl font-bold mb-8 text-center">Manage Coding Questions</h1>

                <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md mb-12">
                    <textarea
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="Enter coding problem statement"
                        rows="6"
                        className="w-full p-3 border rounded mb-4"
                    />
                    <button onClick={addQuestion} className="w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Add Coding Question
                    </button>
                </div>

                <div className="grid gap-6">
                    {questions.map((q) => (
                        <div key={q.id} className="bg-white p-6 rounded-lg shadow-md flex justify-between items-start">
                            <p>{q.question}</p>
                            <button onClick={() => deleteQuestion(q.id)} className="px-4 py-2 bg-red-600 text-white rounded">
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminCoding;