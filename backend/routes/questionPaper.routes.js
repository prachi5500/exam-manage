import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { adminMiddleware } from "../middlewares/authMiddleware.js";
import {
    createQuestionPaper,
    getQuestionPapersBySubject,
    getQuestionPaperDetails,
    deleteQuestionPaper,
    updateQuestionPaper
} from "../controllers/questionPaper.controller.js";

const router = express.Router();

// Students can view question papers
router.get("/", getQuestionPapersBySubject);

// Get specific paper details
router.get("/:paperId", getQuestionPaperDetails);

// Only admin can create/update/delete papers
router.post("/", authMiddleware, adminMiddleware, createQuestionPaper);
router.put("/:paperId", authMiddleware, adminMiddleware, updateQuestionPaper);
router.delete("/:paperId", authMiddleware, adminMiddleware, deleteQuestionPaper);

export default router;
