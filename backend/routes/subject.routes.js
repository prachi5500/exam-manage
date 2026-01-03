import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from '../middlewares/authMiddleware.js';
import {
    getSubjects,
    addSubject,
    deleteSubject
} from "../controllers/subject.controller.js";

const router = express.Router();

// Students can view subjects
router.get("/", getSubjects);  // Public - students need this
// Only admin can add/delete subjects
router.post("/", authMiddleware, adminMiddleware, addSubject);
router.delete("/:id", authMiddleware, adminMiddleware, deleteSubject);

export default router;