// import React, { useState, useEffect } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import Navbar from '../components/Navbar';
// import Timer from '../components/Timer';
// import MCQQuestion from '../components/MCQQuestion';
// import TheoryQuestion from '../components/TheoryQuestion';
// import CodingQuestion from '../components/CodingQuestion';

// const Exam = () => {
//     const { type } = useParams(); // e.g., 'python', 'react-js', 'coding'
//     const capitalizedType = type ? type.replace(/-/g, ' ').charAt(0).toUpperCase() + type.replace(/-/g, ' ').slice(1) : 'Exam';

//     const [isLoading, setIsLoading] = useState(true);
//     const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//     const [answers, setAnswers] = useState({});
//     const [submitted, setSubmitted] = useState(false);
//     const [questions, setQuestions] = useState([]);

//     const storageKey = `${type}Questions`;

//     // useEffect(() => {
//     //     const stored = localStorage.getItem(storageKey);
//     //     if (stored) {
//     //         const parsed = JSON.parse(stored);
//     //         // Ensure options exist for MCQ
//     //         const formatted = parsed.map(q => ({
//     //             ...q,
//     //             options: q.options || []
//     //         }));
//     //         setQuestions(formatted);
//     //     }
//     //     setIsLoading(false);
//     // }, [type]);
//     useEffect(() => {
//         fetch(`http://localhost:5000/api/questions/${type}`)
//             .then(res => res.json())
//             .then(data => setQuestions(data))
//             .finally(() => setIsLoading(false));
//     }, [type]);

//     useEffect(() => {
//         const handleContextMenu = (e) => e.preventDefault();
//         const handleBlur = () => alert('Warning: Switching tabs is not allowed!');

//         document.addEventListener('contextmenu', handleContextMenu);
//         window.addEventListener('blur', handleBlur);

//         return () => {
//             document.removeEventListener('contextmenu', handleContextMenu);
//             window.removeEventListener('blur', handleBlur);
//         };
//     }, []);

//     if (isLoading) {
//         return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-xl">Loading exam...</div>;
//     }

//     if (questions.length === 0) {
//         return (
//             <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//                 <div className="text-center bg-white p-10 rounded-xl shadow-lg">
//                     <h2 className="text-3xl font-bold mb-4">No Questions Found</h2>
//                     <p className="text-lg mb-6">Admin has not added any questions for <strong>{capitalizedType}</strong> yet.</p>
//                     <Link to="/exam-selection" className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
//                         Back to Subject Selection
//                     </Link>
//                 </div>
//             </div>
//         );
//     }

//     const handleAnswer = (answer) => {
//         setAnswers({ ...answers, [currentQuestionIndex]: answer });
//     };

//     // const handleSubmit = () => {
//     //     const submission = {
//     //         timestamp: new Date().toISOString(),
//     //         subject: type,
//     //         answers: Object.entries(answers).map(([idx, ans]) => ({
//     //             question: questions[parseInt(idx)],
//     //             answer: ans || ''
//     //         }))
//     //     };

//     //     const existing = JSON.parse(localStorage.getItem('submissions') || '[]');
//     //     localStorage.setItem('submissions', JSON.stringify([...existing, submission]));
//     //     setSubmitted(true);
//     // };
//     const handleSubmit = async () => {
//   const studentName = prompt("Enter your name/ID:") || "Anonymous";

//   await fetch('http://localhost:5000/api/submissions', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       subject: type,
//       studentName,
//       answers: Object.entries(answers).map(([idx, ans]) => ({
//         question: questions[parseInt(idx)],
//         answer: ans || ''
//       }))
//     })
//   });

//   setSubmitted(true);
// };

//     const handleTimeUp = () => handleSubmit();

//     const nextQuestion = () => {
//         if (currentQuestionIndex < questions.length - 1) {
//             setCurrentQuestionIndex(currentQuestionIndex + 1);
//         }
//     };

//     const prevQuestion = () => {
//         if (currentQuestionIndex > 0) {
//             setCurrentQuestionIndex(currentQuestionIndex - 1);
//         }
//     };

//     if (submitted) {
//         return (
//             <div className="min-h-screen bg-gray-100">
//                 <Navbar />
//                 <div className="container mx-auto p-8 text-center">
//                     <h1 className="text-4xl font-bold mb-6 text-green-600">Exam Submitted Successfully!</h1>
//                     <p className="text-xl mb-8">Your {capitalizedType} exam answers have been saved.</p>
//                     <div className="space-x-6">
//                         <Link to="/results" className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700">
//                             View Results
//                         </Link>
//                         <Link to="/exam-selection" className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
//                             Back to Subjects
//                         </Link>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     const currentQuestion = questions[currentQuestionIndex];
//     const savedAnswer = answers[currentQuestionIndex] || '';

//     // Dynamic rendering based on question structure
//     const isMCQ = currentQuestion.options && currentQuestion.options.length > 0;
//     const isCoding = type.includes('coding') || currentQuestion.type === 'coding'; // If subject has 'coding'

//     return (
//         <div className="min-h-screen bg-gray-100">
//             <Navbar />
//             <div className="container mx-auto p-8">
//                 <Timer duration={10} onTimeUp={handleTimeUp} /> {/* Change duration as needed */}

//                 <div className="bg-white rounded-2xl shadow-xl p-8 mt-6">
//                     <h2 className="text-2xl font-bold mb-6">
//                         Question {currentQuestionIndex + 1} of {questions.length} — {capitalizedType}
//                     </h2>

//                     {isMCQ ? (
//                         <MCQQuestion question={currentQuestion} onAnswer={handleAnswer} savedAnswer={savedAnswer} />
//                     ) : isCoding ? (
//                         <CodingQuestion question={currentQuestion} onAnswer={handleAnswer} savedAnswer={savedAnswer} />
//                     ) : (
//                         <TheoryQuestion question={currentQuestion} onAnswer={handleAnswer} savedAnswer={savedAnswer} />
//                     )}

//                     <div className="flex justify-between mt-10">
//                         <button
//                             onClick={prevQuestion}
//                             disabled={currentQuestionIndex === 0}
//                             className="px-6 py-3 bg-gray-600 text-white rounded-lg disabled:opacity-50 hover:bg-gray-700"
//                         >
//                             Previous
//                         </button>

//                         {currentQuestionIndex === questions.length - 1 ? (
//                             <button
//                                 onClick={handleSubmit}
//                                 className="px-8 py-4 bg-green-600 text-white text-lg font-bold rounded-lg hover:bg-green-700"
//                             >
//                                 Submit Exam
//                             </button>
//                         ) : (
//                             <button
//                                 onClick={nextQuestion}
//                                 className="px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-lg hover:bg-blue-700"
//                             >
//                                 Next Question
//                             </button>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Exam;




import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Filter, Search, Calendar, Clock, 
  Users, Award, ArrowRight, BookOpen 
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Exams = () => {
  const [searchParams] = useSearchParams();
  const examType = searchParams.get('type') || 'all';
  
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetchExams();
  }, [examType]);

  useEffect(() => {
    filterExams();
  }, [searchTerm, selectedSubject, exams]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let response;
      if (examType === 'all') {
        response = await axios.get(`${import.meta.env.VITE_API_URL}/api/exams/active`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Combine all exam types
        const allExams = [
          ...(response.data.exams.mcq || []),
          ...(response.data.exams.coding || []),
          ...(response.data.exams.theory || [])
        ];
        setExams(allExams);
      } else {
        response = await axios.get(`${import.meta.env.VITE_API_URL}/api/exams/type/${examType}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setExams(response.data.exams);
      }

      // Extract unique subjects
      const uniqueSubjects = [...new Set(response.data.exams.map(exam => exam.subject))].filter(Boolean);
      setSubjects(uniqueSubjects);

    } catch (error) {
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const filterExams = () => {
    let filtered = [...exams];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(exam =>
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by subject
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(exam => exam.subject === selectedSubject);
    }

    setFilteredExams(filtered);
  };

  const getExamTypeColor = (type) => {
    switch (type) {
      case 'mcq': return 'bg-blue-100 text-blue-800';
      case 'coding': return 'bg-purple-100 text-purple-800';
      case 'theory': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getExamTypeIcon = (type) => {
    switch (type) {
      case 'mcq': return '🧠';
      case 'coding': return '💻';
      case 'theory': return '📝';
      default: return '📚';
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {examType === 'all' ? 'All Exams' : `${examType.toUpperCase()} Exams`}
              </h1>
              <p className="text-green-100">
                Browse and attempt available examinations
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex space-x-2">
                <Link
                  to="/exams?type=all"
                  className={`px-4 py-2 rounded-lg ${examType === 'all' ? 'bg-white text-green-700' : 'bg-green-700 text-white'}`}
                >
                  All
                </Link>
                <Link
                  to="/exams?type=mcq"
                  className={`px-4 py-2 rounded-lg ${examType === 'mcq' ? 'bg-white text-green-700' : 'bg-green-700 text-white'}`}
                >
                  MCQ
                </Link>
                <Link
                  to="/exams?type=coding"
                  className={`px-4 py-2 rounded-lg ${examType === 'coding' ? 'bg-white text-green-700' : 'bg-green-700 text-white'}`}
                >
                  Coding
                </Link>
                <Link
                  to="/exams?type=theory"
                  className={`px-4 py-2 rounded-lg ${examType === 'theory' ? 'bg-white text-green-700' : 'bg-green-700 text-white'}`}
                >
                  Theory
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search exams by title or description..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="w-full md:w-64">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option value="all">All Subjects</option>
                  {subjects.map((subject, index) => (
                    <option key={index} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.length > 0 ? (
            filteredExams.map((exam) => (
              <div key={exam.examId} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getExamTypeColor(exam.examType)}`}>
                        {getExamTypeIcon(exam.examType)} {exam.examType.toUpperCase()}
                      </span>
                      {exam.subject && (
                        <span className="ml-2 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                          {exam.subject}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {exam.status === 'active' ? '🔴 Live' : '⏳ Upcoming'}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{exam.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{exam.description}</p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-sm">{formatDuration(exam.duration)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <BookOpen className="w-4 h-4 mr-2" />
                      <span className="text-sm">{exam.totalQuestions || 'N/A'} Qs</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Award className="w-4 h-4 mr-2" />
                      <span className="text-sm">{exam.totalMarks} Marks</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        {new Date(exam.scheduledStart).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      By: {exam.createdBy?.name || 'Admin'}
                    </div>
                    <Link
                      to={`/exams/${exam.examId}`}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                      <span>Start Exam</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 mb-4">
                <BookOpen className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-600 mb-2">No exams found</h3>
              <p className="text-gray-500">
                {searchTerm || selectedSubject !== 'all' 
                  ? 'Try changing your search criteria' 
                  : 'No exams available at the moment'}
              </p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 text-center text-gray-600">
          <p>
            Showing <span className="font-bold">{filteredExams.length}</span> of{' '}
            <span className="font-bold">{exams.length}</span> exams
          </p>
        </div>
      </div>
    </div>
  );
};

export default Exams;