# 📚 Exam Management System

## 🎯 Overview

A complete exam management system where:
- **Students** register, login, take exams, and view results
- **Admins** create subjects, questions, and multiple exam papers
- **System** intelligently assigns different papers to students
- **Data** is securely stored in MongoDB (auth) and AWS DynamoDB (exams)

## ✨ Key Features

### 📝 For Students
- ✅ Secure registration with email verification
- ✅ Take exams with automatic paper assignment
- ✅ Get different papers on each exam attempt
- ✅ 60-minute timer with auto-submission
- ✅ Cheating detection (window blur warning)
- ✅ View exam history and results

### 👨‍💼 For Admins
- ✅ Create unlimited question papers per subject
- ✅ Mix and match questions for each paper
- ✅ Create 3 types of questions: MCQ, Theory, Coding
- ✅ Track student attempts
- ✅ View and evaluate submissions

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB connection
- AWS DynamoDB access
- Git

### Installation

```bash
# Backend setup
cd backend
npm install
npm run dev
# Server runs on http://localhost:5000

# Frontend setup (new terminal)
cd exam-frontend
npm install
npm run dev
# App runs on http://localhost:5174
```

### Environment Variables

Create `.env` in both `backend` and `exam-frontend` directories:

**Backend (.env)**:
```
MONGO_URL=your_mongodb_connection
JWT_SECRET=your_secret_key
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=ap-south-1
S3_BUCKET_NAME=your_bucket
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
PORT=5000
```

**Frontend (.env)**:
```
VITE_API_URL=http://localhost:5000
```

## 📋 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - 5-minute setup guide
- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - Complete system documentation
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - What was implemented
- **[DYNAMODB_SETUP.md](./DYNAMODB_SETUP.md)** - Database setup instructions
- **[FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)** - Verification checklist

## 🏗️ System Architecture

```
┌─────────────────┐
│   React App     │
│  (Frontend)     │
└────────┬────────┘
         │
    HTTP API
         │
┌────────▼────────────┐
│   Express Server    │
│   (Backend)         │
└────────┬────────────┘
         │
    ┌────┴────┐
    │          │
MongoDB    DynamoDB
  (Auth)    (Exams)
```

## 🔌 API Endpoints

### Subjects
- `GET /api/subjects` - Get all subjects
- `POST /api/subjects` - Create subject (admin)
- `DELETE /api/subjects/:id` - Delete subject (admin)

### Questions
- `GET /api/questions?subject=x` - Get questions
- `POST /api/questions` - Create question (admin)
- `DELETE /api/questions/:id` - Delete question (admin)

### Question Papers
- `GET /api/question-papers?subject=x` - Get papers
- `POST /api/question-papers` - Create paper (admin)
- `DELETE /api/question-papers/:paperId` - Delete paper (admin)

### Exams
- `POST /api/exams/start` - Start exam with paper assignment
- `POST /api/exams/attempt/:id/submit` - Submit exam
- `GET /api/submissions/student-submissions` - Get my results

### Authentication
- `POST /auth/register` - Register user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `POST /auth/verifyEmail` - Verify email

## 🎯 How It Works

### Student Takes Exam:
1. Login with email/password (MongoDB)
2. Select subject
3. System automatically assigns a paper not yet attempted
4. Get questions from that paper
5. Answer questions in 60 minutes
6. Submit exam
7. Data saved to DynamoDB

### Admin Creates Papers:
1. Create subject: "JavaScript"
2. Create questions (10+)
3. Create Paper 1: Select questions 1-4
4. Create Paper 2: Select questions 5-7
5. Create Paper 3: Select questions 8-10
6. Students get Paper 1 → 2 → 3 on successive attempts

## 📊 Data Storage

### MongoDB
- User accounts
- Authentication data
- User profiles

### DynamoDB
- Subjects
- Questions
- Question Papers
- Exam Attempts
- Submissions
- Results

## 🔐 Security

- ✅ JWT-based authentication
- ✅ Password hashing with bcryptjs
- ✅ Email verification
- ✅ Role-based access control
- ✅ Secure cookie storage
- ✅ CORS protection

## 🧪 Testing

### Test as Admin:
1. Register a user
2. Verify email
3. Update MongoDB: set role to "admin"
4. Create subject
5. Create questions
6. Create question papers

### Test as Student:
1. Register a user
2. Verify email
3. Take exam
4. Submit
5. Take exam again (get different paper)
6. View results

## 📈 System Requirements

- **Runtime**: Node.js 16+
- **Memory**: 512MB minimum
- **Storage**: DynamoDB pay-per-request
- **Network**: AWS connectivity
- **Email**: SMTP configured

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, React Router
- **Backend**: Node.js, Express, Nodemailer
- **Auth DB**: MongoDB
- **Data DB**: AWS DynamoDB
- **Storage**: AWS S3
- **Authentication**: JWT + Cookies

## 📞 Support

For issues:
1. Check documentation files
2. Review backend console logs
3. Check browser console (F12)
4. Check AWS DynamoDB tables
5. Check MongoDB collections

## 🚀 Deployment

### To Production:
1. Set production environment variables
2. Deploy backend to AWS EC2/Lambda
3. Deploy frontend to AWS S3/CloudFront
4. Update API endpoints
5. Configure CORS for production domain
6. Set up HTTPS

## 📝 License

MIT License - Use freely

## 🎓 What This Teaches

- Full-stack web development
- Database design (MongoDB + DynamoDB)
- API development with Express
- React component patterns
- Authentication & authorization
- AWS services integration
- Email notifications
- Real-time exam management

## ✅ Verification

Run this to verify everything is set up:

```bash
# Backend should run without errors
cd backend && npm run dev
# Should show: "Server running on port 5000"

# Frontend should compile without errors
cd exam-frontend && npm run dev
# Should show: "Local: http://localhost:5174"

# Visit http://localhost:5174 in browser
# Should load login page
```

## 🎯 Next Steps

1. ✅ Setup MongoDB
2. ✅ Setup AWS DynamoDB
3. ✅ Configure environment variables
4. ✅ Start backend server
5. ✅ Start frontend app
6. ✅ Create admin account
7. ✅ Create subjects and questions
8. ✅ Create question papers
9. ✅ Test with student account
10. ✅ Deploy to production

## 📅 Updates

- **v1.0** - Initial release with full features
- **Features**: Auth, Exams, Papers, Results, Admin Panel
- **Status**: Production Ready

---

**Exam Management System v1.0**  
**Status**: 🟢 Ready for Use  
**Updated**: January 3, 2026  

Start taking exams! 📚
