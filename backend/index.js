import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import AuthRoutes from './routes/Auth.routes.js'; // Ye file exist karni chahiye
import DbCon from './db/db.js'; // Ye file exist karni chahiye
import { s3Client } from './config/awsConfig.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000; // 5000 ya 3000 – jo pasand ho

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

// ==================== AUTH ROUTES ====================
app.use('/auth', AuthRoutes); // /auth/register, /auth/login etc.

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

// Presigned URL endpoint for frontend uploads
app.post('/api/upload-url', async (req, res) => {
  try {
    const { filename, folder = 'general', contentType = 'application/octet-stream' } = req.body || {};
    if (!filename) return res.status(400).json({ message: 'filename is required' });

    const bucket = process.env.S3_BUCKET_NAME;
    const region = process.env.AWS_REGION || 'ap-south-1';

    const key = `${folder}/${Date.now()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 900 }); // 15 minutes

    const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    return res.json({ url, key, publicUrl });
  } catch (err) {
    console.error('Error generating presigned URL', err);
    return res.status(500).json({ message: 'Failed to generate upload URL', error: err.message });
  }
});