import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { Link } from 'react-router-dom';

const AdminSubmissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scores, setScores] = useState({});  // Per submission scores {subId: {q1:10, ...}}

    const handleScoreChange = (subId, qId, value) => {
        setScores(prev => ({
            ...prev,
            [subId]: { ...prev[subId], [qId]: value }
        }));
    };

    const getQuestionText = (submission, qId) => {
        const q = submission.paper?.questions?.find(q => String(q.id) === String(qId) || String(q._id) === String(qId));
        return q?.question || q?.text || q?.statement || null;
    };

    const evaluate = async (subId) => {
        try {
            const perQ = scores[subId] || {};
            const total = Object.values(perQ).reduce((s, v) => s + Number(v || 0), 0);
            const res = await fetch(`http://localhost:5000/api/submissions/admin/evaluate/${subId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ score: total, feedback: '' })
            });
            if (res.ok) {
                // update local UI
                setSubmissions(prev => prev.map(p => p.submissionId === subId ? { ...p, score: total } : p));
                alert('Evaluated and result saved!');
            } else {
                alert('Evaluation failed');
            }
        } catch (err) {
            console.error(err);
            alert('Evaluation failed');
        }
    };

    useEffect(() => {
        fetch('http://localhost:5000/api/submissions/admin/submissions', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => res.json())
            .then(data => {
                setSubmissions(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error loading submissions', err);
                setLoading(false);
            });
    }, []);

    const deleteSubmission = async (submissionId) => {
        if (!window.confirm('Are you sure you want to delete this submission permanently?')) return;

        try {
            const res = await fetch(`http://localhost:5000/api/submissions/admin/submissions/${submissionId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (res.ok) {
                setSubmissions(submissions.filter(sub => sub.submissionId !== submissionId));
                alert('Submission deleted successfully');
            } else {
                alert('Failed to delete submission');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Error deleting submission');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <div className="container mx-auto p-8 text-center">
                    <p className="text-xl">Loading submissions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto p-8">
                <h1 className="text-4xl font-bold mb-10 text-center text-gray-800">All Student Submissions</h1>

                {submissions.length === 0 ? (
                    <p className="text-center text-gray-600 text-lg">No submissions yet.</p>
                ) : (
                    <div className="grid gap-8">
                        {submissions.map((sub) => (
                            <div key={sub.submissionId} className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold capitalize">
                                            {sub.subject?.replace(/-/g, ' ') || 'Unknown Subject'} Exam
                                        </h2>
                                        <p className="text-gray-600 mt-2">
                                            Submitted by: <span className="font-medium">{sub.userName || sub.userId || 'Unknown User'}</span>
                                        </p>
                                        {sub.paper?.title && (
                                            <p className="text-gray-600">Paper: <span className="font-medium">{sub.paper.title}</span></p>
                                        )}
                                        {typeof sub.score !== 'undefined' && (
                                            <p className="text-gray-600">Score: <span className="font-medium">{sub.score}</span></p>
                                        )}
                                        <p className="text-gray-600">
                                            Date: {new Date(sub.submittedAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="mt-4">
                                        <h4>Evaluate Scores:</h4>
                                        {Object.entries(sub.answers).map(([qId, ans]) => (
                                            <div key={qId}>
                                                <label>Score for Question {qId}:</label>
                                                <input type="number" onChange={(e) => handleScoreChange(sub.submissionId, qId, e.target.value)} />
                                            </div>
                                        ))}
                                        <button onClick={() => evaluate(sub.submissionId)}>Submit Evaluation</button>
                                    </div>
                                    <button
                                        onClick={() => deleteSubmission(sub.submissionId)}
                                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                    >
                                        Delete Submission
                                    </button>
                                </div>

                                <div className="border-t pt-6">
                                    <h3 className="text-xl font-semibold mb-4">Answers:</h3>
                                    {Object.entries(sub.answers || {}).length === 0 ? (
                                        <p className="text-gray-500 italic">No answers recorded</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {Object.entries(sub.answers).map(([questionId, answer]) => (
                                                <div key={questionId} className="bg-gray-50 p-4 rounded-lg">
                                                    <p className="font-medium text-sm text-gray-700 mb-1">
                                                        {getQuestionText(sub, questionId) || 'Question'}
                                                    </p>
                                                    <p className="text-gray-800 break-words whitespace-pre-wrap">
                                                        {typeof answer === 'string' || typeof answer === 'number'
                                                            ? (answer || <em className="text-gray-500">(No answer provided)</em>)
                                                            : JSON.stringify(answer)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-12 text-center">
                    <Link
                        to="/admin-dashboard"
                        className="inline-block px-8 py-4 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
                    >
                        ← Back to Admin Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminSubmissions;