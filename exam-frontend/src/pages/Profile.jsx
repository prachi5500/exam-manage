import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserExams();
    }
  }, [user]);

  const fetchUserExams = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/student-submissions`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filter exams for current user
        const userExams = data.filter(exam => exam.studentName === user.email);
        setExams(userExams);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubjectStats = () => {
    const stats = {};
    exams.forEach(exam => {
      const subject = exam.subject || 'Unknown';
      stats[subject] = (stats[subject] || 0) + 1;
    });
    return stats;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Please Login First</h2>
          <Link to="/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg">
            Login
          </Link>
        </div>
      </div>
    );
  }

  const subjectStats = getSubjectStats();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto p-4 md:p-8">
        {/* User Profile Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 mb-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row items-center md:items-start">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 md:mb-0 md:mr-8">
              <span className="text-4xl text-blue-600 font-bold">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-blue-100">{user.email}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <span className={`px-4 py-1 rounded-full ${user.role === 'admin' ? 'bg-yellow-500' : 'bg-green-500'}`}>
                  {user.role === 'admin' ? '👑 Admin' : '👤 Student'}
                </span>
                <span className="px-4 py-1 bg-blue-400 rounded-full">
                  📊 {exams.length} Exams
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Exams</h3>
            <p className="text-4xl font-bold text-blue-600">{exams.length}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Subjects</h3>
            <p className="text-4xl font-bold text-green-600">{Object.keys(subjectStats).length}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Status</h3>
            <p className="text-2xl font-bold text-purple-600">Active</p>
          </div>
        </div>

        {/* Subject-wise Breakdown */}
        {Object.keys(subjectStats).length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">Subject Performance</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(subjectStats).map(([subject, count]) => (
                <div key={subject} className="border rounded-lg p-4 text-center">
                  <h4 className="font-semibold capitalize">{subject.replace(/-/g, ' ')}</h4>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{count}</p>
                  <p className="text-sm text-gray-500">attempt{count > 1 ? 's' : ''}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Exam History */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recent Exams</h2>
            <Link to="/results" className="text-blue-600 hover:underline">
              View All →
            </Link>
          </div>
          
          {loading ? (
            <p className="text-center py-8">Loading your exams...</p>
          ) : exams.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">You haven't taken any exams yet.</p>
              <Link to="/exam-selection" className="px-6 py-3 bg-blue-600 text-white rounded-lg">
                Take Your First Exam
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left">Subject</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Questions</th>
                    <th className="p-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.slice(0, 5).map((exam, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium capitalize">
                        {exam.subject ? exam.subject.replace(/-/g, ' ') : 'Unknown'}
                      </td>
                      <td className="p-3">
                        {new Date(exam.timestamp).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        {exam.answers?.length || 0} questions
                      </td>
                      <td className="p-3">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          Completed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default Profile;