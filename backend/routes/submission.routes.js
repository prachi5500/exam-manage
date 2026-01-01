import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from '../middlewares/authMiddleware.js';
import {
  getAllSubmissions,
  getUserSubmissions,
  postSubmission,
  deleteSubmission
} from "../controllers/submission.controller.js";
import { evaluateSubmission } from "../controllers/submission.controller.js";

const router = express.Router();

router.get("/admin/submissions", authMiddleware, adminMiddleware, getAllSubmissions);
router.get("/student-submissions", authMiddleware, adminMiddleware, getUserSubmissions);
router.post("/", authMiddleware, adminMiddleware, postSubmission);
router.post("/evaluate/:id", authMiddleware, adminMiddleware, evaluateSubmission);
router.delete("/admin/submissions/:id", authMiddleware, adminMiddleware, deleteSubmission);

export default router;