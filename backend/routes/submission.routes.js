import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";

import {
  getAllSubmissions,
  deleteSubmission
} from "../controllers/submission.controller.js";

const router = express.Router();

router.get("/admin/submissions", authMiddleware, getAllSubmissions);
router.delete("/admin/submissions/:id", authMiddleware, deleteSubmission);

export default router;
