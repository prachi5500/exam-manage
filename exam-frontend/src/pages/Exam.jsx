// src/pages/Exam.jsx (Updated with cheating detection and dynamic duration)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Timer from '../components/Timer';
import MCQQuestion from '../components/MCQQuestion';
import TheoryQuestion from '../components/TheoryQuestion';
import CodingQuestion from '../components/CodingQuestion';
import Loader from '../components/Loader';
import { useCheatingDetection } from '../hooks/useCheatingDetection';
import toast from 'react-hot-toast';

const Exam = () => {
  const { subject } = useParams();
  const navigate = useNavigate();
  const [attemptId, setAttemptId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [duration, setDuration] = useState(60); // minutes - will be fetched from paper

  // Enable cheating detection
  const { getCheatingLog } = useCheatingDetection(attemptId, true);

  useEffect(() => {
    const start = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/exam-attempts/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ subject })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Failed to start exam');

        setAttemptId(data.examAttemptId);
        setQuestions(data.questions || []);
        setAnswers(data.savedAnswers || {});
        
        // Set duration from paper
        if (data.durationMinutes) {
          setDuration(data.durationMinutes);
        }
        
        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error(err.message || 'Failed to start exam');
        navigate('/exam-selection');
      }
    };
    start();
  }, [subject, navigate]);

  useEffect(() => {
    if (!attemptId) return;

    const saveTimer = setTimeout(async () => {
      try {
        await fetch(`http://localhost:5000/api/exam-attempts/attempt/${attemptId}/answers`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ answers })
        });
      } catch (err) {
        console.error('Auto-save failed:', err);
      }
    }, 2000);

    return () => clearTimeout(saveTimer);
  }, [answers, attemptId]);

  const handleAnswer = (qId, answer) => {
    setAnswers(prev => ({ ...prev, [qId]: answer }));
  };

  const handleSubmit = async () => {
    // Check for unanswered questions
    const unanswered = questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0 && !window.confirm(`You have ${unanswered.length} unanswered questions. Do you want to submit anyway?`)) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/exam-attempts/attempt/${attemptId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ answers })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Submit failed');

      toast.success('Exam submitted successfully!');
      navigate('/results');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTimeUp = () => {
    toast.error('Time up! Submitting automatically...');
    handleSubmit();
  };

  if (loading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><Loader /></div>;

  if (!questions.length) return <div className="min-h-screen bg-gray-100 flex items-center justify-center">No questions available</div>;

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
          <div className="flex justify-between mb-8">
            <h2 className="text-2xl font-bold capitalize">{subject.replace(/-/g, ' ')} Exam</h2>
            <Timer duration={duration} onTimeUp={handleTimeUp} />
          </div>

          <div className="mb-8">
            <p className="text-gray-600 mb-4">Question {currentIndex + 1} of {questions.length}</p>

            {currentQuestion.type === 'mcq' ? (
              <MCQQuestion
                question={currentQuestion}
                onAnswer={(ans) => handleAnswer(currentQuestion.id, ans)}
                savedAnswer={answers[currentQuestion.id]}
              />
            ) : currentQuestion.type === 'theory' ? (
              <TheoryQuestion
                question={currentQuestion}
                onAnswer={(ans) => handleAnswer(currentQuestion.id, ans)}
                savedAnswer={answers[currentQuestion.id]}
              />
            ) : (
              <CodingQuestion
                question={currentQuestion}
                onAnswer={(ans) => handleAnswer(currentQuestion.id, ans)}
                savedAnswer={answers[currentQuestion.id]}
              />
            )}
          </div>

          <div className="flex justify-between mt-8">
            {currentIndex > 0 && (
              <button
                onClick={() => setCurrentIndex(currentIndex - 1)}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Previous
              </button>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Exam'}
            </button>

            {currentIndex < questions.length - 1 && (
              <button
                onClick={() => setCurrentIndex(currentIndex + 1)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exam;