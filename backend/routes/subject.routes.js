import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from '../middlewares/authMiddleware.js';
import {
    getSubjects,
    addSubject,
    deleteSubject
} from "../controllers/subject.controller.js";

const router = express.Router();

// All routes protected — only admin can access
router.get("/", authMiddleware, adminMiddleware, getSubjects);  // Admin only
router.post("/", authMiddleware, adminMiddleware, addSubject);
router.delete("/:id", authMiddleware, adminMiddleware, deleteSubject);

export default router;