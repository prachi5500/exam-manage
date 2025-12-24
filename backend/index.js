import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import AuthRoutes from './routes/Auth.routes.js'; // Ye file exist karni chahiye
import DbCon from './db/db.js'; // Ye file exist karni chahiye

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000; // 5000 ya 3000 – jo pasand ho

// CORS configuration - dono possible frontend ports ko allow kiya
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:5173'],
  credentials: true, // Agar cookies/auth use kar rahe ho to true
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Database connection
DbCon();


app.use('/auth', AuthRoutes); 

// ==================== EXAM SYSTEM ROUTES ====================

// In-memory storage (temporary - MongoDB baad mein connect kar lena)
let examSubjects = ['mcq', 'theory', 'coding'];
let questions = {}; // { 'react-js': [...], 'python': [...] }
let submissions = [];

// Get all subjects
app.get('/api/subjects', (req, res) => {
  res.json(examSubjects);
});

// Add new subject
app.post('/api/subjects', (req, res) => {
  const { subject } = req.body;
  const formatted = subject.toLowerCase().replace(/\s+/g, '-');
  if (!examSubjects.includes(formatted)) {
    examSubjects.push(formatted);
    questions[formatted] = [];
    res.status(201).json({ message: 'Subject added', subjects: examSubjects });
  } else {
    res.status(400).json({ message: 'Subject already exists' });
  }
});

// Delete subject
app.delete('/api/subjects/:subject', (req, res) => {
  const { subject } = req.params;
  examSubjects = examSubjects.filter(s => s !== subject);
  delete questions[subject];
  res.json({ message: 'Subject deleted', subjects: examSubjects });
});

// Get questions for a subject
app.get('/api/questions/:subject', (req, res) => {
  const { subject } = req.params;
  res.json(questions[subject] || []);
});

// Add question to subject
app.post('/api/questions/:subject', (req, res) => {
  const { subject } = req.params;
  const { question, options } = req.body;

  if (!questions[subject]) {
    questions[subject] = [];
  }

  const newQuestion = {
    id: Date.now(),
    question,
    options: options || []
  };

  questions[subject].push(newQuestion);
  res.status(201).json(newQuestion);
});

// Delete question
app.delete('/api/questions/:subject/:id', (req, res) => {
  const { subject, id } = req.params;
  if (questions[subject]) {
    questions[subject] = questions[subject].filter(q => q.id != id);
  }
  res.json({ message: 'Question deleted' });
});

// Submit exam answers
app.post('/api/submissions', (req, res) => {
  const submission = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    subject: req.body.subject,
    studentName: req.body.studentName || 'Anonymous',
    answers: req.body.answers
  };
  submissions.push(submission);
  res.status(201).json({ message: 'Exam submitted successfully' });
});

// Get all submissions (admin)
app.get('/api/submissions', (req, res) => {
  res.json(submissions);
});

// Get student submissions summary
app.get('/api/student-submissions', (req, res) => {
  const summary = submissions.map(sub => ({
    id: sub.id,
    subject: sub.subject.replace(/-/g, ' '),
    studentName: sub.studentName,
    timestamp: sub.timestamp,
    totalQuestions: sub.answers.length
  }));
  res.json(summary);
});




// ==================== AUTH CHECK ENDPOINT ====================
app.get('/auth/check-login', async (req, res) => {
  try {
    // यहाँ आप session या JWT token check करेंगे
    // Temporary के लिए simple check:
    
    // Check if there's a session or token in cookies
    const sessionToken = req.cookies?.sessionToken;
    
    if (!sessionToken) {
      return res.status(401).json({ message: 'Not logged in' });
    }
    
    // MongoDB में session check करें (या JWT verify करें)
    // Example: Find user by session token
    // const user = await Usermodel.findOne({ sessionToken });
    
    // Temporary response (आप अपने logic से replace करें)
    res.json({
      _id: "user_id_here",
      name: "User Name",
      email: "user@example.com",
      role: "user"
    });
    
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== LOGOUT ENDPOINT ====================
app.post('/auth/logout', async (req, res) => {
  try {
    // Clear session from database
    // Clear cookie
    res.clearCookie('sessionToken');
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});





// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});