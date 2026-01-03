import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { adminMiddleware } from "../middlewares/authMiddleware.js";
import {
    startExam,
    getExamAttempt,
    updateExamAnswers,
    submitExam,
    getStudentExamAttempts,
    getAllExamAttempts
} from "../controllers/examAttempt.controller.js";

const router = express.Router();

// Student routes
router.post("/start", authMiddleware, startExam);  // Start a new exam
router.get("/attempt/:examAttemptId", authMiddleware, getExamAttempt);  // Get exam details
router.put("/attempt/:examAttemptId/answers", authMiddleware, updateExamAnswers);  // Save answers
router.post("/attempt/:examAttemptId/submit", authMiddleware, submitExam);  // Submit exam
router.get("/student/attempts", authMiddleware, getStudentExamAttempts);  // Get my attempts

// Admin routes
router.get("/admin/all-attempts", authMiddleware, adminMiddleware, getAllExamAttempts);

export default router;
