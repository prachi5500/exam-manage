import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

const AdminSubmissionsReview = () => {
    const [pendingSubmissions, setPendingSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [score, setScore] = useState('');
    const [feedback, setFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchPendingSubmissions();
    }, []);

    const fetchPendingSubmissions = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/submissions/admin/pending', {
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setPendingSubmissions(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load pending submissions');
            setLoading(false);
        }
    };

    const handleApproveSubmission = async () => {
        if (!selectedSubmission) return;
        if (!score.trim()) {
            toast.error('Please enter a score');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(
                `http://localhost:5000/api/submissions/admin/evaluate/${selectedSubmission.submissionId}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        score: Number(score),
                        feedback: feedback.trim()
                    })
                }
            );

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to evaluate');
            }

            toast.success('Submission approved!');
            setSelectedSubmission(null);
            setScore('');
            setFeedback('');
            setPendingSubmissions(pendingSubmissions.filter(s => s.submissionId !== selectedSubmission.submissionId));
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-20">Loading submissions...</div>;

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto p-8">
                <h1 className="text-4xl font-bold mb-8 text-center">Review Student Submissions</h1>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Submission List */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-xl font-bold mb-4">
                                Pending: {pendingSubmissions.length}
                            </h2>
                            {pendingSubmissions.length === 0 ? (
                                <p className="text-gray-600 text-center py-8">
                                    No pending submissions
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {pendingSubmissions.map((sub) => (
                                        <button
                                            key={sub.submissionId}
                                            onClick={() => setSelectedSubmission(sub)}
                                            className={`w-full text-left p-4 rounded-lg border-l-4 transition ${selectedSubmission?.submissionId === sub.submissionId
                                                    ? 'bg-blue-100 border-blue-600'
                                                    : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                                                }`}
                                        >
                                            <p className="font-semibold text-sm capitalize">
                                                {sub.subject?.replace(/-/g, ' ')}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                {new Date(sub.submittedAt).toLocaleDateString()}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submission Details */}
                    <div className="md:col-span-2">
                        {!selectedSubmission ? (
                            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                                <p className="text-gray-600 text-lg">
                                    Select a submission to review
                                </p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <div className="mb-6 pb-6 border-b">
                                    <h2 className="text-2xl font-bold mb-2 capitalize">
                                        {selectedSubmission.subject?.replace(/-/g, ' ')}
                                    </h2>
                                    <p className="text-gray-600">
                                        Submitted: {new Date(selectedSubmission.submittedAt).toLocaleString()}
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        Paper: {selectedSubmission.paperId}
                                    </p>
                                </div>

                                {/* Student Answers */}
                                <div className="mb-6 max-h-96 overflow-y-auto bg-gray-50 p-4 rounded">
                                    <h3 className="font-bold mb-4 text-lg">Student Answers:</h3>
                                    {Object.entries(selectedSubmission.answers || {}).length === 0 ? (
                                        <p className="text-gray-600">No answers provided</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {Object.entries(selectedSubmission.answers).map(([qId, ans]) => (
                                                <div key={qId} className="border-l-4 border-blue-600 pl-4">
                                                    <p className="font-semibold text-sm text-gray-700">
                                                        Q{qId}:
                                                    </p>
                                                    <p className="text-gray-800 mt-1">
                                                        {typeof ans === 'object' ? JSON.stringify(ans, null, 2) : ans || '(No answer)'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Scoring Form */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium mb-2">Score</label>
                                    <input
                                        type="number"
                                        value={score}
                                        onChange={(e) => setScore(e.target.value)}
                                        placeholder="e.g., 85"
                                        className="w-full p-3 border rounded-lg"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium mb-2">Feedback (Optional)</label>
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Add feedback for the student..."
                                        className="w-full p-3 border rounded-lg h-24"
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={handleApproveSubmission}
                                        disabled={submitting}
                                        className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {submitting ? 'Approving...' : '✓ Approve & Score'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedSubmission(null);
                                            setScore('');
                                            setFeedback('');
                                        }}
                                        className="flex-1 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <Link to="/admin-dashboard" className="px-8 py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminSubmissionsReview;
