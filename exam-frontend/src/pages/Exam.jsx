import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Timer from '../components/Timer';
import MCQQuestion from '../components/MCQQuestion';
import TheoryQuestion from '../components/TheoryQuestion';
import CodingQuestion from '../components/CodingQuestion';
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
  const duration = 60; // Minutes

  useEffect(() => {
    console.log("🔍 Exam page mounted with subject param:", subject);
  }, [subject]);

  // Redirect if no subject
  // useEffect(() => {
  //   if (!subject) {
  //     toast.error('No subject selected! Redirecting...');
  //     navigate('/exam-selection', { replace: true });
  //     return;
  //   }
  // }, [subject, navigate]);
  useEffect(() => {
    console.log("Exam page loaded with subject:", subject);
    if (!subject) {
      toast.error('No subject found in URL!');
      navigate('/exam-selection');
    }
  }, [subject, navigate]);

  // Start exam: Create attempt and get questions
  useEffect(() => {
    if (!subject) return;

    const startExamFlow = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/exam-attempt/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ subject }),
        });

        if (!res.ok) {
          const errData = await res.json();
          toast.error(errData.message || 'Failed to start exam');
          navigate('/exam-selection');
          return;
        }

        const data = await res.json();
        setAttemptId(data.attemptId);
        setQuestions(data.questions); // Assigned from paper
      } catch (err) {
        console.error(err);
        toast.error('Network error starting exam');
        navigate('/exam-selection');
      } finally {
        setLoading(false);
      }
    };

    startExamFlow();
  }, [subject, navigate]);

  // Cheating detection
  useEffect(() => {
    let warningCount = 0;
    const handleBlur = () => {
      if (warningCount === 0) {
        toast.error('Warning: Do not switch windows!');
        warningCount++;
      } else {
        toast.error('Cheating detected! Auto-submitting...');
        handleSubmit(true);
      }
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, []);

  const handleAnswer = (ans) => {
    const q = questions[currentIndex];
    setAnswers({ ...answers, [q.id]: ans });
  };

  const handleSubmit = async (auto = false) => {
    if (!attemptId) return;

    setSubmitting(true);
    try {
      // Autosave current answers before final submit
      try {
        await fetch(`http://localhost:5000/api/exam-attempt/attempt/${attemptId}/answers`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ answers })
        });
      } catch (e) {
        console.warn('Autosave before submit failed', e);
      }

      const res = await fetch(`http://localhost:5000/api/exam-attempt/attempt/${attemptId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ answers, autoSubmit: auto }),
      });

      if (res.ok) {
        toast.success(auto ? 'Exam auto-submitted!' : 'Exam submitted!');
        navigate('/results');
      } else {
        toast.error('Submission failed');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-xl">Starting exam...</div>;

  if (questions.length === 0) {
    return (
      <div className="text-center py-20 text-orange-600 text-2xl">
        No question paper available for "{subject}".<br />
        Ask admin to create one.
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  let QuestionComponent = null;
  if (currentQuestion.type === 'mcq') QuestionComponent = MCQQuestion;
  else if (currentQuestion.type === 'theory') QuestionComponent = TheoryQuestion;
  else if (currentQuestion.type === 'coding') QuestionComponent = CodingQuestion;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto p-6 max-w-4xl">
        <Timer duration={duration} onTimeUp={() => handleSubmit()} />
        <div className="bg-white rounded-xl shadow-lg p-8 mt-6">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Question {currentIndex + 1} / {questions.length}
          </h2>
          <QuestionComponent
            question={currentQuestion}
            onAnswer={handleAnswer}
            savedAnswer={answers[currentQuestion.id] || ''}
          />
          <div className="flex justify-between mt-10">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg disabled:opacity-50"
            >
              Previous
            </button>

            <div className="flex items-center space-x-4">
              {currentIndex !== questions.length - 1 && (
                <button
                  onClick={() => setCurrentIndex(currentIndex + 1)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Next
                </button>
              )}

              <button
                onClick={() => {
                  if (submitting) return;
                  const ok = window.confirm('Are you sure you want to submit the exam now?');
                  if (ok) handleSubmit();
                }}
                disabled={submitting}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Exam'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exam;