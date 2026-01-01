// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import Navbar from '../components/Navbar';
// import Timer from '../components/Timer';
// import MCQQuestion from '../components/MCQQuestion';
// import TheoryQuestion from '../components/TheoryQuestion';
// import CodingQuestion from '../components/CodingQuestion';

// const Exam = () => {
//   const { subject } = useParams();
//   const navigate = useNavigate();
//   const [questions, setQuestions] = useState([]);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [answers, setAnswers] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);

//   useEffect(() => {
//     fetch(`http://localhost:5000/api/questions?subject=${subject}`, {
//       headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//     })
//       .then(res => res.json())
//       .then(data => {
//         setQuestions(data);
//         setLoading(false);
//       })
//       .catch(err => {
//         console.error(err);
//         setLoading(false);
//       });
//   }, [subject]);

//   const handleAnswer = (qId, answer) => {
//     setAnswers({ ...answers, [qId]: answer });
//   };

//   const handleSubmit = async () => {
//     if (window.confirm('Submit exam? You cannot change answers after submission.')) {
//       setSubmitting(true);
//       try {
//         await fetch('http://localhost:5000/api/submissions', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${localStorage.getItem('token')}`
//           },
//           body: JSON.stringify({
//             subject,
//             answers,
//             totalQuestions: questions.length
//           })
//         });
//         alert('Exam submitted successfully!');
//         navigate('/results');
//       } catch (error) {
//         console.error(error);
//         alert('Submission failed');
//       }
//       setSubmitting(false);
//     }
//   };

//   const onTimeUp = () => {
//     alert('Time is up! Auto-submitting...');
//     handleSubmit();
//   };

//   if (loading) return <div className="text-center py-20">Loading exam...</div>;
//   if (questions.length === 0) return <div className="text-center py-20">No questions available</div>;

//   const currentQuestion = questions[currentIndex];

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar />
//       <div className="container mx-auto p-8 max-w-4xl">
//         <div className="bg-white rounded-lg shadow-lg p-8">
//           <div className="flex justify-between items-center mb-6">
//             <h1 className="text-3xl font-bold capitalize">{subject.replace(/-/g, ' ')} Exam</h1>
//             <Timer duration={30} onTimeUp={onTimeUp} /> {/* 30 minutes */}
//           </div>

//           <div className="mb-6 text-sm text-gray-600">
//             Question {currentIndex + 1} of {questions.length}
//           </div>

//           {currentQuestion.type === 'mcq' && (
//             <MCQQuestion question={currentQuestion} onAnswer={(ans) => handleAnswer(currentQuestion.id, ans)} />
//           )}
//           {currentQuestion.type === 'theory' && (
//             <TheoryQuestion question={currentQuestion} onAnswer={(ans) => handleAnswer(currentQuestion.id, ans)} />
//           )}
//           {currentQuestion.type === 'coding' && (
//             <CodingQuestion question={currentQuestion} onAnswer={(ans) => handleAnswer(currentQuestion.id, ans)} />
//           )}

//           <div className="flex justify-between mt-8">
//             <button
//               onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
//               disabled={currentIndex === 0}
//               className="px-6 py-3 bg-gray-600 text-white rounded disabled:opacity-50"
//             >
//               Previous
//             </button>

//             {currentIndex === questions.length - 1 ? (
//               <button
//                 onClick={handleSubmit}
//                 disabled={submitting}
//                 className="px-8 py-3 bg-green-600 text-white rounded hover:bg-green-700"
//               >
//                 {submitting ? 'Submitting...' : 'Submit Exam'}
//               </button>
//             ) : (
//               <button
//                 onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
//                 className="px-6 py-3 bg-blue-600 text-white rounded"
//               >
//                 Next
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Exam;


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
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const duration = 60;  // Minutes

  // Cheating detection
  useEffect(() => {
    let warningCount = 0;
    const handleBlur = () => {
      if (warningCount === 0) {
        toast.error('Warning: Do not switch windows or tabs!');
        warningCount++;
      } else {
        toast.error('Cheating detected! Auto-submitting exam.');
        handleSubmit(true);  // Auto-submit
      }
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, []);

  // Fetch and randomize questions (pattern: 4 MCQ, 3 Theory, 3 Coding)
  useEffect(() => {
    fetch(`http://localhost:5000/api/questions?subject=${subject}`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        // Filter by type
        const mcqs = data.filter(q => q.type === 'mcq').sort(() => 0.5 - Math.random()).slice(0, 4);
        const theories = data.filter(q => q.type === 'theory').sort(() => 0.5 - Math.random()).slice(0, 3);
        const codings = data.filter(q => q.type === 'coding').sort(() => 0.5 - Math.random()).slice(0, 3);
        const shuffled = [...mcqs, ...theories, ...codings].sort(() => 0.5 - Math.random());  // Mix order
        setQuestions(shuffled);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [subject]);

  const handleAnswer = (ans) => {
    const q = questions[currentIndex];
    setAnswers({ ...answers, [q.id]: ans });
  };

  const handleSubmit = async (auto = false) => {
    setSubmitting(true);
    try {
      await fetch('http://localhost:5000/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subject, answers, examId: 'some-exam-id', autoSubmit: auto }),  // Add exam details
      });
      toast.success(auto ? 'Exam auto-submitted due to cheating.' : 'Exam submitted!');
      navigate('/results');
    } catch (err) {
      toast.error('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading exam...</div>;
  if (questions.length === 0) return <div>No questions available.</div>;

  const q = questions[currentIndex];
  let QuestionComponent;
  if (q.type === 'mcq') QuestionComponent = MCQQuestion;
  else if (q.type === 'theory') QuestionComponent = TheoryQuestion;
  else if (q.type === 'coding') QuestionComponent = CodingQuestion;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto p-4">
        <Timer duration={duration} onTimeUp={() => handleSubmit()} />
        <div className="bg-white p-6 rounded-lg shadow-md mt-4">
          <h2 className="text-xl font-bold mb-4">Question {currentIndex + 1} of {questions.length}</h2>
          <QuestionComponent question={q} onAnswer={handleAnswer} savedAnswer={answers[q.id]} />
          <div className="flex justify-between mt-6">
            <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0}>
              Previous
            </button>
            {currentIndex === questions.length - 1 ? (
              <button onClick={() => handleSubmit()} disabled={submitting}>Submit Exam</button>
            ) : (
              <button onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}>Next</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exam;