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

// router.get("/", authMiddleware, getQuestions);
// router.post("/", authMiddleware, addQuestion);
// router.delete("/:id", authMiddleware, deleteQuestion);
router.get("/", authMiddleware, adminMiddleware, getQuestions);  // Admin only
router.post("/", authMiddleware, adminMiddleware, addQuestion);
router.delete("/:id", authMiddleware, adminMiddleware, deleteQuestion);

export default router;
