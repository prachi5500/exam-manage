import express from "express";
// import { auth } from "../middleware/auth.middleware.js";
import {
  getQuestions,
  addQuestion,
  deleteQuestion
} from "../controllers/question.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";


const router = express.Router();

router.get("/", authMiddleware, getQuestions);
router.post("/", authMiddleware, addQuestion);
router.delete("/:id", authMiddleware, deleteQuestion);

export default router;
