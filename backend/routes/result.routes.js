import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from '../middlewares/authMiddleware.js';
import { getAllResults, getUserResults, addResult, deleteResult } from "../controllers/result.controller.js";

const router = express.Router();

router.get("/admin/results", authMiddleware, adminMiddleware, getAllResults);
router.get("/student-results", authMiddleware, getUserResults);  // Students can get their own
router.get("/my-results", authMiddleware, getUserResults);  // Alias for my results
router.post("/", authMiddleware, addResult);  // Students can add results
router.delete("/:id", authMiddleware, adminMiddleware, deleteResult);

export default router;