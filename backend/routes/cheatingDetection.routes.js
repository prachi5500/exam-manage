import express from 'express';
import { 
    detectCheating, 
    reportCheatActivity, 
    getCheatingReport,
    getAllCheatingReports 
} from '../controllers/cheatingDetection.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Report cheating activity during exam
router.post('/report-activity', authMiddleware, reportCheatActivity);

// Get cheating report for specific exam attempt

// Get all cheating reports (admin only)
router.get('/admin/all-reports', authMiddleware, getAllCheatingReports);

// Detect cheating
router.post('/detect', authMiddleware, detectCheating);

export default router;
