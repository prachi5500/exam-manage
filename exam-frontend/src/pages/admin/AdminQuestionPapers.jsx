import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const AdminQuestionPapers = () => {
    const { subject } = useParams();
    const navigate = useNavigate();
    const [papers, setPapers] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [paperTitle, setPaperTitle] = useState('');
    const [durationMinutes, setDurationMinutes] = useState('');
    const [selectedQuestions, setSelectedQuestions] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch existing papers
                const papersRes = await fetch(`http://localhost:5000/api/question-papers?subject=${subject}`, {
                    credentials: 'include'
                });
                const papersData = await papersRes.json();
                setPapers(Array.isArray(papersData) ? papersData : []);

                // Fetch all questions
                const questionsRes = await fetch(`http://localhost:5000/api/questions?subject=${subject}`, {
                    credentials: 'include'
                });
                const questionsData = await questionsRes.json();
                setQuestions(Array.isArray(questionsData) ? questionsData : []);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchData();
    }, [subject]);

    const handleSelectQuestion = (qId) => {
        if (selectedQuestions.includes(qId)) {
            setSelectedQuestions(selectedQuestions.filter(id => id !== qId));
        } else {
            setSelectedQuestions([...selectedQuestions, qId]);
        }
    };

    const handleCreatePaper = async () => {
        if (!paperTitle.trim()) {
            alert('Paper title is required');
            return;
        }
        if (!durationMinutes || durationMinutes <= 0) {
            alert('Duration must be greater than 0 minutes');
            return;
        }
        if (selectedQuestions.length === 0) {
            alert('Select at least one question');
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/question-papers', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject,
                    title: paperTitle,
                    questionIds: selectedQuestions,
                    durationMinutes: parseInt(durationMinutes)
                })
            });

            if (res.ok) {
                const newPaper = await res.json();
                setPapers([...papers, newPaper.paper]);
                setPaperTitle('');
                setDurationMinutes('');
                setSelectedQuestions([]);
                setShowForm(false);
                alert('Question paper created successfully!');
            } else {
                alert('Failed to create paper');
            }
        } catch (err) {
            alert('Error creating paper');
            console.error(err);
        }
    };

    const handleDeletePaper = async (paperId) => {
        if (!window.confirm('Delete this paper?')) return;

        try {
            const res = await fetch(`http://localhost:5000/api/question-papers/${paperId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (res.ok) {
                setPapers(papers.filter(p => p.paperId !== paperId));
                alert('Paper deleted');
            } else {
                alert('Failed to delete paper');
            }
        } catch (err) {
            alert('Error deleting paper');
        }
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto p-8">
                <h1 className="text-4xl font-bold mb-8 text-center capitalize">
                    Create Question Papers for {subject.replace(/-/g, ' ')}
                </h1>

                {!showForm ? (
                    <div className="text-center mb-12">
                        <button
                            onClick={() => setShowForm(true)}
                            className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            + Create New Paper
                        </button>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg mb-12">
                        <h2 className="text-2xl font-bold mb-6">Create Question Paper</h2>

                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Paper Title</label>
                            <input
                                type="text"
                                value={paperTitle}
                                onChange={(e) => setPaperTitle(e.target.value)}
                                placeholder="e.g., Paper 1, Midterm, Final Exam"
                                className="w-full p-3 border rounded-lg"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Exam Duration (Minutes)</label>
                            <input
                                type="number"
                                value={durationMinutes}
                                onChange={(e) => setDurationMinutes(e.target.value)}
                                placeholder="e.g., 60, 120, 180"
                                min="1"
                                className="w-full p-3 border rounded-lg"
                            />
                            <p className="text-sm text-gray-500 mt-1">Set how many minutes students will have to complete this paper</p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-4">Select Questions</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto border rounded-lg p-4">
                                {questions.map((q) => (
                                    <label key={q.id} className="flex items-start cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedQuestions.includes(q.id)}
                                            onChange={() => handleSelectQuestion(q.id)}
                                            className="mt-1 mr-3"
                                        />
                                        <span className="text-sm">
                                            <span className="font-medium capitalize">{q.type}</span>: {q.question.substring(0, 50)}...
                                        </span>
                                    </label>
                                ))}
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                Selected: {selectedQuestions.length} questions
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleCreatePaper}
                                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Create Paper
                            </button>
                            <button
                                onClick={() => {
                                    setShowForm(false);
                                    setPaperTitle('');
                                    setDurationMinutes('');
                                    setSelectedQuestions([]);
                                }}
                                className="flex-1 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {papers.length > 0 && (
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold mb-6">Existing Papers</h2>
                        <div className="grid gap-6">
                            {papers.map((paper) => (
                                <div key={paper.paperId} className="bg-white p-6 rounded-lg shadow-md">
                                    <h3 className="text-xl font-bold mb-2">{paper.title}</h3>
                                    <p className="text-gray-600 mb-2">
                                        Questions: {paper.questionIds?.length || 0}
                                    </p>
                                    <p className="text-blue-600 font-semibold mb-4">
                                        ⏱️ Duration: {paper.durationMinutes} minutes
                                    </p>
                                    <button
                                        onClick={() => handleDeletePaper(paper.paperId)}
                                        className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-12 text-center">
                    <Link to="/admin-dashboard" className="px-8 py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminQuestionPapers;
