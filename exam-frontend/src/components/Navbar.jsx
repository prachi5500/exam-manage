import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="bg-blue-600 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-xl font-bold">College Exam System</h1>
                <div className="flex space-x-4">
                    <Link to="/" className="text-sm hover:underline">Home</Link>
                    {/* <Link to="/exam-selection" className="text-sm hover:underline">Exam</Link> */}
                    <Link to="/results" className="text-sm hover:underline">Results</Link>
                    <Link to="/admin-dashboard" className="text-sm hover:underline">Admin</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;