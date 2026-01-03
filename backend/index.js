import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import AuthRoutes from './routes/Auth.routes.js';
import DbCon from './db/db.js';
import { s3Client } from './config/awsConfig.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// import questionRoutes from "./routes/question.routes.js";
// import submissionRoutes from "./routes/submission.routes.js";
// import subjectRoutes from "./routes/subject.routes.js";
// import resultRoutes from "./routes/result.routes.js";
// import questionPaperRoutes from "./routes/questionPaper.routes.js";
import subjectRoutes from "./routes/subject.routes.js";
import questionRoutes from "./routes/question.routes.js";
import questionPaperRoutes from "./routes/questionPaper.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import resultRoutes from "./routes/result.routes.js";
import examAttemptRoutes from "./routes/examAttempt.routes.js";
import cheatingDetectionRoutes from "./routes/cheatingDetection.routes.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allow frontends running on localhost ports (add 5174 for Vite dev)
const allowedOrigins = [
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy: Origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/auth', AuthRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/question-papers", questionPaperRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/exams", examAttemptRoutes);
app.use("/api/exam-attempts", examAttemptRoutes);
app.use("/api/cheating-detection", cheatingDetectionRoutes);

// Presigned URL for S3 Upload
app.post('/api/generate-presigned-url', async (req, res) => {
  try {
    const { filename, folder = 'general', contentType = 'application/octet-stream' } = req.body;
    if (!filename) return res.status(400).json({ message: 'filename is required' });

    const bucket = process.env.S3_BUCKET_NAME;
    const region = process.env.AWS_REGION || 'ap-south-1';
    const key = `${folder}/${Date.now()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    return res.json({ url, key, publicUrl });
  } catch (err) {
    console.error('Error generating presigned URL', err);
    return res.status(500).json({ message: 'Failed to generate upload URL', error: err.message });
  }
});

// Connect MongoDB and start server
DbCon().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});