import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from '../middlewares/authMiddleware.js';
import {
  getAllSubmissions,
  getUserSubmissions,
  postSubmission,
  deleteSubmission,
  getPendingSubmissions
} from "../controllers/submission.controller.js";
import { evaluateSubmission } from "../controllers/submission.controller.js";

const router = express.Router();

router.get("/admin/submissions", authMiddleware, adminMiddleware, getAllSubmissions);
router.get("/admin/pending", authMiddleware, adminMiddleware, getPendingSubmissions);
router.get("/student-submissions", authMiddleware, getUserSubmissions);  // Students can get their own
router.post("/", authMiddleware, postSubmission);  // Students can submit
router.post("/admin/evaluate/:submissionId", authMiddleware, adminMiddleware, evaluateSubmission);
router.delete("/admin/submissions/:id", authMiddleware, adminMiddleware, deleteSubmission);

export default router;