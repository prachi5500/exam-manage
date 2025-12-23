import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ExamSelection from './pages/ExamSelection'; // New page
import Exam from './pages/Exam';
import Results from './pages/Results';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTheory from './pages/admin/AdminTheory';
import AdminMCQ from './pages/admin/AdminMCQ';
import AdminCoding from './pages/admin/AdminCoding';
import AdminSubmissions from './pages/admin/AdminSubmissions';
import AdminSubjects from './pages/admin/AdminSubjects'; // New admin page for subjects
import DynamicQuestionManager from './pages/admin/DynamicQuestionManager';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/exam-selection" element={<ExamSelection />} /> // New route
                <Route path="/exam/:type" element={<Exam />} /> // Updated to accept type param
                <Route path="/results" element={<Results />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/admin-theory" element={<AdminTheory />} />
                <Route path="/admin-mcq" element={<AdminMCQ />} />
                <Route path="/admin-coding" element={<AdminCoding />} />
                <Route path="/admin-submissions" element={<AdminSubmissions />} />
                <Route path="/admin-subjects" element={<AdminSubjects />} /> // New route
                <Route path="/admin-questions/:subject" element={<DynamicQuestionManager />} />
            </Routes>
        </Router>
    );
}

export default App;