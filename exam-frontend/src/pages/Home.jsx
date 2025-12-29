import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Home = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto p-4 text-center py-12">
                <h1 className="text-4xl font-bold mb-8 text-gray-800">Online Exam Platform</h1>
                <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
                    Test your abilities with our comprehensive exam system.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <Link 
                        to="/exam-selection" 
                        className="bg-blue-600 hover:bg-blue-700 text-white p-10 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
                    >
                        <h2 className="text-2xl font-bold mb-4">Take Exam</h2>
                        <p className="text-lg">Choose MCQ, Theory or Coding section</p>
                    </Link>

                    <Link 
                        to="/results" 
                        className="bg-green-600 hover:bg-green-700 text-white p-10 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
                    >
                        <h2 className="text-2xl font-bold mb-4">View Results</h2>
                        <p className="text-lg">Check your previous submissions</p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Home;