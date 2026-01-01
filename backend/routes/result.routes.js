import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from '../middlewares/authMiddleware.js';
import { getAllResults, getUserResults, addResult, deleteResult } from "../controllers/result.controller.js";

const router = express.Router();

router.get("/admin/results", authMiddleware, adminMiddleware, getAllResults);
router.get("/student-results", authMiddleware, adminMiddleware, getUserResults);
router.post("/", authMiddleware, adminMiddleware, addResult);
router.delete("/:id", authMiddleware, adminMiddleware, deleteResult);

export default router;