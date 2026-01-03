import express from "express";
// import { auth } from "../middleware/auth.middleware.js";
import adminMiddleware from '../middlewares/authMiddleware.js';
import {
  getQuestions,
  addQuestion,
  deleteQuestion
} from "../controllers/question.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";


const router = express.Router();

// Students can view questions
router.get("/", getQuestions);  // Public - students need this
// Only admin can add/delete questions
router.post("/", authMiddleware, adminMiddleware, addQuestion);
router.delete("/:id", authMiddleware, adminMiddleware, deleteQuestion);

export default router;
