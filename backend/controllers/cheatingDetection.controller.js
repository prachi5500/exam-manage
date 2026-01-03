import { docClient as ddb } from "../config/awsConfig.js";
import { ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuid } from "uuid";

// Cheating detection logic
export const detectCheating = async (req, res) => {
    try {
        const { examAttemptId, userId } = req.body;

        if (!examAttemptId || !userId) {
            return res.status(400).json({ success: false, message: "Exam attempt ID and user ID are required" });
        }

        const cheatFlags = {
            tabSwitches: 0,
            fullscreenExits: 0,
            rapidAnswerChanges: 0,
            suspiciousActivity: false,
            riskLevel: "low" // low, medium, high
        };

        // Log cheating attempt
        const cheatingLogId = uuid();
        const cheatingLog = {
            cheatingLogId,
            examAttemptId,
            userId,
            detectedAt: Date.now(),
            cheatFlags
        };

        await ddb.send(new UpdateCommand({
            TableName: "ExamAttempts",
            Key: { examAttemptId },
            UpdateExpression: "SET cheatingFlags = :flags, lastActivityAt = :time",
            ExpressionAttributeValues: {
                ":flags": cheatFlags,
                ":time": Date.now()
            }
        }));

        res.json({
            success: true,
            message: "Cheating detection logged",
            cheatingLogId
        });
    } catch (error) {
        console.error("Cheating detection error:", error);
        res.status(500).json({ success: false, message: "Cheating detection failed", error: error.message });
    }
};

// Report cheating activity
export const reportCheatActivity = async (req, res) => {
    try {
        const { examAttemptId, activityType, severity } = req.body;

        if (!examAttemptId || !activityType) {
            return res.status(400).json({ success: false, message: "Exam attempt ID and activity type are required" });
        }

        const validActivities = [
            'tab-switch',
            'fullscreen-exit',
            'window-blur',
            'copy-paste-attempt',
            'right-click-attempt',
            'suspicious-pattern'
        ];

        if (!validActivities.includes(activityType)) {
            return res.status(400).json({ success: false, message: "Invalid activity type" });
        }

        // Update the exam attempt with cheating flag
        await ddb.send(new UpdateCommand({
            TableName: "ExamAttempts",
            Key: { examAttemptId },
            UpdateExpression: "SET cheatingAlerts = if_not_exists(cheatingAlerts, :empty) + :alert, cheatingSuspicious = :suspicious, lastActivityAt = :time",
            ExpressionAttributeValues: {
                ":empty": [],
                ":alert": [{
                    alertId: uuid(),
                    type: activityType,
                    severity: severity || 'warning',
                    timestamp: Date.now()
                }],
                ":suspicious": true,
                ":time": Date.now()
            }
        }));

        res.json({
            success: true,
            message: `${activityType} activity logged`,
            activityType,
            severity: severity || 'warning'
        });
    } catch (error) {
        console.error("Report cheat activity error:", error);
        res.status(500).json({ success: false, message: "Failed to report activity", error: error.message });
    }
};

// Get cheating report for admin
export const getCheatingReport = async (req, res) => {
    try {
        const { examAttemptId } = req.params;

        if (!examAttemptId) {
            return res.status(400).json({ success: false, message: "Exam attempt ID is required" });
        }

        const data = await ddb.send(new ScanCommand({
            TableName: "ExamAttempts"
        }));

        const attempt = (data.Items || []).find(item => item.examAttemptId === examAttemptId);

        if (!attempt) {
            return res.status(404).json({ success: false, message: "Exam attempt not found" });
        }

        const report = {
            examAttemptId,
            userId: attempt.userId,
            subject: attempt.subject,
            suspiciousActivity: attempt.cheatingSuspicious || false,
            alerts: attempt.cheatingAlerts || [],
            riskLevel: calculateRiskLevel(attempt.cheatingAlerts || []),
            totalAlerts: (attempt.cheatingAlerts || []).length
        };

        res.json(report);
    } catch (error) {
        console.error("Get cheating report error:", error);
        res.status(500).json({ success: false, message: "Failed to get cheating report", error: error.message });
    }
};

// Helper function to calculate risk level
const calculateRiskLevel = (alerts) => {
    if (alerts.length === 0) return "low";

    const severeCount = alerts.filter(a => a.severity === 'critical').length;
    const warningCount = alerts.filter(a => a.severity === 'warning').length;

    if (severeCount >= 3) return "high";
    if (severeCount >= 1 || warningCount >= 5) return "medium";
    return "low";
};

// Get all cheating reports for admin
export const getAllCheatingReports = async (req, res) => {
    try {
        const data = await ddb.send(new ScanCommand({
            TableName: "ExamAttempts"
        }));

        const reports = (data.Items || [])
            .filter(item => item.cheatingSuspicious || (item.cheatingAlerts && item.cheatingAlerts.length > 0))
            .map(item => ({
                examAttemptId: item.examAttemptId,
                userId: item.userId,
                subject: item.subject,
                suspiciousActivity: item.cheatingSuspicious || false,
                totalAlerts: (item.cheatingAlerts || []).length,
                riskLevel: calculateRiskLevel(item.cheatingAlerts || []),
                lastActivity: item.lastActivityAt
            }));

        res.json({
            success: true,
            reports,
            totalSuspiciousAttempts: reports.length
        });
    } catch (error) {
        console.error("Get all cheating reports error:", error);
        res.status(500).json({ success: false, message: "Failed to get cheating reports", error: error.message });
    }
};
