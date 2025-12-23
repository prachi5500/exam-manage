import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Auth Components
import Register from './components/Register';
import VerifyEmail from './components/VerifyEmail';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

// Main App Pages
import Home from './pages/Home';
import ExamSelection from './pages/ExamSelection';
import Exam from './pages/Exam';
import Results from './pages/Results';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTheory from './pages/admin/AdminTheory';
import AdminMCQ from './pages/admin/AdminMCQ';
import AdminCoding from './pages/admin/AdminCoding';
import AdminSubmissions from './pages/admin/AdminSubmissions';
import AdminSubjects from './pages/admin/AdminSubjects';
import DynamicQuestionManager from './pages/admin/DynamicQuestionManager';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
        {/* Global Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#fff',
              borderRadius: '8px',
              padding: '16px',
            },
            success: {
              style: { background: '#059669' },
            },
            error: {
              style: { background: '#dc2626' },
            },
          }}
        />

        <Routes>
          {/* ====================== AUTH ROUTES ====================== */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* ====================== MAIN APP ROUTES ====================== */}
          <Route path="/home" element={<Home />} />
          <Route path="/exam-selection" element={<ExamSelection />} />
          <Route path="/exam/:type" element={<Exam />} /> {/* e.g., /exam/mcq */}
          <Route path="/results" element={<Results />} />

          {/* ====================== ADMIN ROUTES ====================== */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-theory" element={<AdminTheory />} />
          <Route path="/admin-mcq" element={<AdminMCQ />} />
          <Route path="/admin-coding" element={<AdminCoding />} />
          <Route path="/admin-submissions" element={<AdminSubmissions />} />
          <Route path="/admin-subjects" element={<AdminSubjects />} />
          <Route path="/admin-questions/:subject" element={<DynamicQuestionManager />} />

          {/* ====================== FALLBACK ====================== */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;