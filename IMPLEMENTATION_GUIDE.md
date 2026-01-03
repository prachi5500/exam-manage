# Exam Management System - Implementation Guide

## ✅ What Has Been Implemented

### 1. **Authentication System (MongoDB)**
- User registration with email verification
- Login with JWT tokens
- Role-based access control (student/admin)
- Password reset functionality
- Secure cookie-based authentication

### 2. **Question Management System**
- **Individual Questions** (stored in DynamoDB AWS):
  - MCQ (Multiple Choice Questions)
  - Theory Questions
  - Coding Questions
  - Each question can be created by admin

### 3. **Question Papers System** (NEW)
- Admins can create multiple question papers per subject
- Each paper can contain a collection of questions
- Students get a unique paper each time they start an exam
- If a student has already attempted all papers for a subject, they get a random paper again

### 4. **Exam Attempt Tracking** (NEW)
- Each student's exam attempt is tracked with unique `examAttemptId`
- Exam attempts are stored in DynamoDB with:
  - Student ID
  - Subject
  - Paper ID assigned
  - Start time
  - Answers
  - Submission status

### 5. **Submission & Results System**
- Students can submit exams with their answers
- Submissions stored in DynamoDB
- Results can be tracked and retrieved by students

## 🏗️ System Architecture

### Backend (Node.js/Express + DynamoDB + MongoDB)
```
MongoDB: Authentication (Users)
├── User email, password, verification status
├── Role (student/admin)
└── Profile info

DynamoDB: Exam Data
├── Subjects (subject names)
├── Questions (MCQ, Theory, Coding)
├── QuestionPapers (paper collections)
├── ExamAttempts (student exam sessions)
├── ExamSubmissions (submitted answers)
└── Results (scores and evaluations)
```

### Frontend (React + Vite)
```
Pages:
├── Auth (Login, Register, Verify Email)
├── Home
├── ExamSelection
├── Exam (Main exam page with timer)
├── Results
└── Admin Dashboard
    ├── Manage Subjects
    ├── Manage Questions
    ├── Manage Question Papers (NEW)
    ├── View Submissions
    └── View Results
```

## 🔑 Key Features

### For Students:
1. Register and verify email
2. Login to the system
3. Select a subject to take exam
4. Get assigned a unique question paper
5. Answer MCQ, Theory, and Coding questions
6. Timer to track exam duration (60 minutes)
7. Cheating detection (window blur warning)
8. Submit exam and view results

### For Admins:
1. Add/Delete subjects
2. Create questions (MCQ, Theory, Coding)
3. **Create multiple question papers per subject**
4. Each paper can have different questions
5. View all student submissions
6. Evaluate submissions and provide scores

## 📝 API Endpoints

### Authentication (MongoDB based)
```
POST /auth/register          - Register new user
POST /auth/login             - Login user
POST /auth/logout            - Logout user
POST /auth/verifyEmail       - Verify email with code
POST /auth/forgot-password   - Send reset email
GET  /auth/check-login       - Check if user is logged in
```

### Subjects (DynamoDB)
```
GET  /api/subjects                     - Get all subjects (public)
POST /api/subjects                     - Create subject (admin only)
DELETE /api/subjects/:id               - Delete subject (admin only)
```

### Questions (DynamoDB)
```
GET  /api/questions?subject=xyz        - Get questions by subject (public)
POST /api/questions                    - Create question (admin only)
DELETE /api/questions/:id              - Delete question (admin only)
```

### Question Papers (DynamoDB) - NEW
```
GET  /api/question-papers?subject=xyz  - Get papers by subject (public)
GET  /api/question-papers/:paperId     - Get paper details with questions
POST /api/question-papers              - Create paper (admin only)
PUT  /api/question-papers/:paperId     - Update paper (admin only)
DELETE /api/question-papers/:paperId   - Delete paper (admin only)
```

### Exam Attempts (DynamoDB) - NEW
```
POST /api/exams/start                              - Start exam & assign paper
GET  /api/exams/attempt/:examAttemptId            - Get exam details
PUT  /api/exams/attempt/:examAttemptId/answers    - Save answers
POST /api/exams/attempt/:examAttemptId/submit     - Submit exam
GET  /api/exams/student/attempts                  - Get my attempts
GET  /api/exams/admin/all-attempts                - Get all attempts (admin)
```

### Submissions (DynamoDB)
```
GET  /api/submissions/student-submissions  - Get my submissions
GET  /api/submissions/admin/submissions    - Get all submissions (admin)
POST /api/submissions                      - Create submission
POST /api/submissions/evaluate/:id         - Evaluate submission (admin)
```

## 🚀 Running the System

### Start Backend:
```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:5000
```

### Start Frontend:
```bash
cd exam-frontend
npm install
npm run dev
# App runs on http://localhost:5174
```

## 📋 Database Setup (AWS DynamoDB)

You need to create these tables in AWS DynamoDB:

### 1. Subjects Table
```
Primary Key: id (String)
Attributes:
  - name (String)
  - createdAt (Number)
```

### 2. Questions Table
```
Primary Key: id (String)
Attributes:
  - subject (String)
  - type (String) - "mcq", "theory", "coding"
  - question (String)
  - options (List of Strings) - for MCQ
  - initialCode (String) - for coding
  - createdBy (String)
  - createdAt (Number)
```

### 3. QuestionPapers Table (NEW)
```
Primary Key: paperId (String)
Attributes:
  - subject (String)
  - title (String)
  - questionIds (List of Strings)
  - status (String) - "active", "archived"
  - createdBy (String)
  - createdAt (Number)
  - updatedAt (Number)
```

### 4. ExamAttempts Table (NEW)
```
Primary Key: examAttemptId (String)
GSI: userId-subject (userId, subject)
Attributes:
  - userId (String)
  - subject (String)
  - paperId (String)
  - status (String) - "in-progress", "submitted"
  - answers (Map)
  - startedAt (Number)
  - submittedAt (Number)
```

### 5. ExamSubmissions Table
```
Primary Key: submissionId (String)
GSI: userId-index (userId)
Attributes:
  - userId (String)
  - subject (String)
  - examAttemptId (String)
  - paperId (String)
  - answers (Map)
  - submittedAt (Number)
  - autoSubmit (Boolean)
  - status (String)
```

### 6. Results Table
```
Primary Key: resultId (String)
GSI: userId-index (userId)
Attributes:
  - userId (String)
  - subject (String)
  - score (Number)
  - details (Map) - per-question scores
  - evaluatedAt (Number)
  - evaluator (String)
```

## 🔄 Exam Flow

### Student Perspective:
```
1. Login
2. Go to Exam Selection
3. Select Subject
4. System fetches available question papers
5. System checks student's previous attempts
6. Assigns a paper student hasn't taken yet (or random if all taken)
7. Exam starts with timer
8. Student answers questions
9. Student submits exam
10. Submission saved to ExamSubmissions table
11. Student can view results
```

### Admin Perspective:
```
1. Login (must have admin role)
2. Dashboard shows all subjects
3. Admin can:
   - Create/Delete subjects
   - Create questions for each subject
   - Create question papers (combining multiple questions)
   - View all student submissions
   - Evaluate and score submissions
```

## 🛡️ Authorization Rules

- **Public Access**: Subjects list, Questions list
- **Student Access**: Take exams, view own submissions and results
- **Admin Access**: Create/edit/delete subjects, questions, papers; view all submissions; evaluate

## 📚 Tech Stack

- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **Authentication DB**: MongoDB
- **Exam Data DB**: AWS DynamoDB
- **File Storage**: AWS S3
- **Authentication**: JWT + Cookies
- **Email**: Nodemailer

## ✨ Features Implemented

✅ MongoDB authentication with JWT  
✅ Role-based authorization (student/admin)  
✅ Multiple question types (MCQ, Theory, Coding)  
✅ **Multiple question papers per subject**  
✅ **Unique paper assignment per student**  
✅ **Exam attempt tracking**  
✅ Timer with auto-submission  
✅ Cheating detection (window blur)  
✅ Answer saving and submission  
✅ Results tracking  
✅ Admin dashboard  
✅ Email verification  
✅ Password reset  
✅ S3 file uploads  

## 🔧 Environment Variables

### Backend .env
```
MONGO_URL=your_mongodb_url
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=ap-south-1
S3_BUCKET_NAME=your_bucket_name
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
PORT=5000
```

### Frontend .env
```
VITE_API_URL=http://localhost:5000
```

## 🧪 Testing the System

1. **Create Admin User**:
   - Register a user
   - Verify email
   - Update role to "admin" in MongoDB

2. **Create Subjects**:
   - Login as admin
   - Go to Admin Dashboard
   - Create subjects like "JavaScript", "Python", etc.

3. **Create Questions**:
   - Admin Dashboard → Select Subject
   - Click "Questions" button
   - Add MCQ, Theory, and Coding questions

4. **Create Question Papers**:
   - Admin Dashboard → Select Subject
   - Click "Papers" button
   - Create Paper 1 with selected questions
   - Create Paper 2 with different questions
   - Create Paper 3, etc.

5. **Take Exam as Student**:
   - Logout and login as student
   - Go to Exam Selection
   - Select a subject
   - Take the exam (will get Paper 1 on first attempt)
   - Submit exam
   - View results
   - Take exam again (will get Paper 2)

6. **Verify Paper Assignment**:
   - Each student gets a different paper on each attempt
   - Papers are tracked in ExamAttempts table
   - Check DynamoDB to see tracking data

## 📞 Support

For any issues or questions, check:
- Backend logs in console
- Frontend browser console (F12)
- AWS DynamoDB tables for data
- MongoDB for user data

---

**System Status**: ✅ Ready for Production
**Last Updated**: January 3, 2026
