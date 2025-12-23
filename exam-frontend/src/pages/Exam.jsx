import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Timer from '../components/Timer';
import MCQQuestion from '../components/MCQQuestion';
import TheoryQuestion from '../components/TheoryQuestion';
import CodingQuestion from '../components/CodingQuestion';

const Exam = () => {
    const { type } = useParams(); // e.g., 'python', 'react-js', 'coding'
    const capitalizedType = type ? type.replace(/-/g, ' ').charAt(0).toUpperCase() + type.replace(/-/g, ' ').slice(1) : 'Exam';

    const [isLoading, setIsLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [questions, setQuestions] = useState([]);

    const storageKey = `${type}Questions`;

    // useEffect(() => {
    //     const stored = localStorage.getItem(storageKey);
    //     if (stored) {
    //         const parsed = JSON.parse(stored);
    //         // Ensure options exist for MCQ
    //         const formatted = parsed.map(q => ({
    //             ...q,
    //             options: q.options || []
    //         }));
    //         setQuestions(formatted);
    //     }
    //     setIsLoading(false);
    // }, [type]);
    useEffect(() => {
        fetch(`http://localhost:5000/api/questions/${type}`)
            .then(res => res.json())
            .then(data => setQuestions(data))
            .finally(() => setIsLoading(false));
    }, [type]);

    useEffect(() => {
        const handleContextMenu = (e) => e.preventDefault();
        const handleBlur = () => alert('Warning: Switching tabs is not allowed!');

        document.addEventListener('contextmenu', handleContextMenu);
        window.addEventListener('blur', handleBlur);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            window.removeEventListener('blur', handleBlur);
        };
    }, []);

    if (isLoading) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-xl">Loading exam...</div>;
    }

    if (questions.length === 0) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center bg-white p-10 rounded-xl shadow-lg">
                    <h2 className="text-3xl font-bold mb-4">No Questions Found</h2>
                    <p className="text-lg mb-6">Admin has not added any questions for <strong>{capitalizedType}</strong> yet.</p>
                    <Link to="/exam-selection" className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Back to Subject Selection
                    </Link>
                </div>
            </div>
        );
    }

    const handleAnswer = (answer) => {
        setAnswers({ ...answers, [currentQuestionIndex]: answer });
    };

    // const handleSubmit = () => {
    //     const submission = {
    //         timestamp: new Date().toISOString(),
    //         subject: type,
    //         answers: Object.entries(answers).map(([idx, ans]) => ({
    //             question: questions[parseInt(idx)],
    //             answer: ans || ''
    //         }))
    //     };

    //     const existing = JSON.parse(localStorage.getItem('submissions') || '[]');
    //     localStorage.setItem('submissions', JSON.stringify([...existing, submission]));
    //     setSubmitted(true);
    // };
    const handleSubmit = async () => {
  const studentName = prompt("Enter your name/ID:") || "Anonymous";

  await fetch('http://localhost:5000/api/submissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subject: type,
      studentName,
      answers: Object.entries(answers).map(([idx, ans]) => ({
        question: questions[parseInt(idx)],
        answer: ans || ''
      }))
    })
  });

  setSubmitted(true);
};

    const handleTimeUp = () => handleSubmit();

    const nextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const prevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <div className="container mx-auto p-8 text-center">
                    <h1 className="text-4xl font-bold mb-6 text-green-600">Exam Submitted Successfully!</h1>
                    <p className="text-xl mb-8">Your {capitalizedType} exam answers have been saved.</p>
                    <div className="space-x-6">
                        <Link to="/results" className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            View Results
                        </Link>
                        <Link to="/exam-selection" className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Back to Subjects
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const savedAnswer = answers[currentQuestionIndex] || '';

    // Dynamic rendering based on question structure
    const isMCQ = currentQuestion.options && currentQuestion.options.length > 0;
    const isCoding = type.includes('coding') || currentQuestion.type === 'coding'; // If subject has 'coding'

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto p-8">
                <Timer duration={10} onTimeUp={handleTimeUp} /> {/* Change duration as needed */}

                <div className="bg-white rounded-2xl shadow-xl p-8 mt-6">
                    <h2 className="text-2xl font-bold mb-6">
                        Question {currentQuestionIndex + 1} of {questions.length} — {capitalizedType}
                    </h2>

                    {isMCQ ? (
                        <MCQQuestion question={currentQuestion} onAnswer={handleAnswer} savedAnswer={savedAnswer} />
                    ) : isCoding ? (
                        <CodingQuestion question={currentQuestion} onAnswer={handleAnswer} savedAnswer={savedAnswer} />
                    ) : (
                        <TheoryQuestion question={currentQuestion} onAnswer={handleAnswer} savedAnswer={savedAnswer} />
                    )}

                    <div className="flex justify-between mt-10">
                        <button
                            onClick={prevQuestion}
                            disabled={currentQuestionIndex === 0}
                            className="px-6 py-3 bg-gray-600 text-white rounded-lg disabled:opacity-50 hover:bg-gray-700"
                        >
                            Previous
                        </button>

                        {currentQuestionIndex === questions.length - 1 ? (
                            <button
                                onClick={handleSubmit}
                                className="px-8 py-4 bg-green-600 text-white text-lg font-bold rounded-lg hover:bg-green-700"
                            >
                                Submit Exam
                            </button>
                        ) : (
                            <button
                                onClick={nextQuestion}
                                className="px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-lg hover:bg-blue-700"
                            >
                                Next Question
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Exam;