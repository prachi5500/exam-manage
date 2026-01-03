import { docClient as ddb, s3Client } from "../config/awsConfig.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { ScanCommand, PutCommand, DeleteCommand, GetCommand, UpdateCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuid } from "uuid";

// Start an exam (create exam attempt and assign question paper)
export const startExam = async (req, res) => {
    try {
        const { subject } = req.body;
        const userId = req.user.userId;

        if (!subject) {
            return res.status(400).json({ success: false, message: "Subject is required" });
        }

        // Get all available question papers for this subject - scan without filter to avoid expression issues
        const papersData = await ddb.send(new ScanCommand({
            TableName: "QuestionPapers"
        }));

        // Filter in code instead of using FilterExpression - normalize stored subject, be defensive
        const normalizedSubject = subject.trim().toLowerCase();
        const papers = (papersData.Items || []).filter(p =>
            (p.subject || '').toString().trim().toLowerCase() === normalizedSubject && (p.status === "active" || !p.status)
        );

        console.log(`Found ${papers.length} papers for subject=${normalizedSubject}`);

        if (papers.length === 0) {
            console.warn(`No question papers found for subject: ${subject}`);
            return res.status(404).json({ success: false, message: "No question papers available for this subject" });
        }

        // Get student's previous attempts for this subject - scan all and filter in code
        const attemptsData = await ddb.send(new ScanCommand({
            TableName: "ExamAttempts"
        }));

        const previousAttempts = (attemptsData.Items || [])
            .filter(a => a.userId === userId && a.subject === subject.trim().toLowerCase())
            .map(a => a.paperId);

        // Select a paper that hasn't been attempted yet, or pick randomly
        let selectedPaper = papers.find(p => !previousAttempts.includes(p.paperId));

        if (!selectedPaper) {
            // If all papers attempted or no untouched paper, pick a random one
            selectedPaper = papers[Math.floor(Math.random() * papers.length)];
        }

        if (!selectedPaper) {
            console.warn('No question paper could be selected despite earlier check');
            return res.status(500).json({ success: false, message: 'Failed to select a question paper' });
        }

        console.log(`Selected paperId=${selectedPaper.paperId} title=${selectedPaper.title || '<untitled>'}`);

        // Create exam attempt record
        const examAttemptId = uuid();
        const examAttempt = {
            examAttemptId,
            userId,
            subject: subject.trim().toLowerCase(),
            paperId: selectedPaper.paperId,
            startedAt: Date.now(),
            status: "in-progress",
            answers: {},
            submittedAt: null
        };

        await ddb.send(new PutCommand({
            TableName: "ExamAttempts",
            Item: examAttempt
        }));

        // Fetch full paper details with questions
        const questions = await Promise.all(
            (selectedPaper.questionIds || []).map(qId =>
                ddb.send(new GetCommand({
                    TableName: "Questions",
                    Key: { id: qId }
                })).then(r => r.Item).catch(err => { console.error('Question fetch error', err); return null; })
            )
        );

        res.json({
            success: true,
            examAttemptId,
            paperId: selectedPaper.paperId,
            subject,
            questions: questions.filter(q => q !== null),
            paperTitle: selectedPaper.title,
            durationMinutes: selectedPaper.durationMinutes || 60
        });
    } catch (error) {
        console.error("Start exam error:", error);
        res.status(500).json({ success: false, message: "Failed to start exam", error: error.message });
    }
};

// Get student's current exam attempt
export const getExamAttempt = async (req, res) => {
    try {
        const { examAttemptId } = req.params;

        const data = await ddb.send(new GetCommand({
            TableName: "ExamAttempts",
            Key: { examAttemptId }
        }));

        if (!data.Item) {
            return res.status(404).json({ error: "Exam attempt not found" });
        }

        res.json(data.Item);
    } catch (error) {
        console.error("Get exam attempt error:", error);
        res.status(500).json({ error: "Failed to fetch exam attempt" });
    }
};

// Update exam attempt with answers
export const updateExamAnswers = async (req, res) => {
    try {
        const { examAttemptId } = req.params;
        const { answers } = req.body;

        await ddb.send(new UpdateCommand({
            TableName: "ExamAttempts",
            Key: { examAttemptId },
            UpdateExpression: "SET answers = :answers",
            ExpressionAttributeValues: { ":answers": answers || {} }
        }));

        res.json({ success: true, message: "Answers updated" });
    } catch (error) {
        console.error("Update answers error:", error);
        res.status(500).json({ error: "Failed to update answers" });
    }
};

// Submit exam (convert from in-progress to submitted)
export const submitExam = async (req, res) => {
    try {
        const { examAttemptId } = req.params;
        const { answers, autoSubmit } = req.body;

        // Get exam attempt
        const examData = await ddb.send(new GetCommand({
            TableName: "ExamAttempts",
            Key: { examAttemptId }
        }));

        if (!examData.Item) {
            return res.status(404).json({ error: "Exam attempt not found" });
        }

        const attempt = examData.Item;

        // Create submission record
        const submission = {
            submissionId: uuid(),
            userId: attempt.userId,
            subject: attempt.subject,
            examAttemptId,
            paperId: attempt.paperId,
            answers: answers || attempt.answers || {},
            submittedAt: Date.now(),
            autoSubmit: autoSubmit || false,
            status: "submitted"
        };

        // Save submission
        await ddb.send(new PutCommand({
            TableName: "ExamSubmissions",
            Item: submission
        }));

        // Backup submission to S3 (optional) - do not fail submission if S3 backup fails
        try {
            const bucket = process.env.S3_BUCKET_NAME;
            if (bucket) {
                const key = `submissions/${submission.submissionId}.json`;
                const body = JSON.stringify(submission);
                await s3Client.send(new PutObjectCommand({
                    Bucket: bucket,
                    Key: key,
                    Body: body,
                    ContentType: 'application/json'
                }));
            }
        } catch (s3Err) {
            console.error('S3 backup failed for submission', submission.submissionId, s3Err.message);
        }

        // Update attempt status
        await ddb.send(new UpdateCommand({
            TableName: "ExamAttempts",
            Key: { examAttemptId },
            UpdateExpression: "SET #status = :status, submittedAt = :submittedAt, answers = :answers",
            ExpressionAttributeValues: {
                ":status": "submitted",
                ":submittedAt": Date.now(),
                ":answers": answers || {}
            },
            ExpressionAttributeNames: { "#status": "status" }
        }));

        res.json({
            success: true,
            message: "Exam submitted successfully",
            submissionId: submission.submissionId,
            submission
        });
    } catch (error) {
        console.error("Submit exam error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to submit exam",
            details: error.message
        });
    }
};

// Get all exam attempts for a student - scan and filter in code
export const getStudentExamAttempts = async (req, res) => {
    try {
        const userId = req.user.userId;

        const data = await ddb.send(new ScanCommand({
            TableName: "ExamAttempts"
        }));

        const studentAttempts = (data.Items || []).filter(item => item.userId === userId);
        res.json(studentAttempts);
    } catch (error) {
        console.error("Get student attempts error:", error);
        res.status(500).json({ error: "Failed to fetch exam attempts" });
    }
};

// Get all exam attempts for admin
export const getAllExamAttempts = async (req, res) => {
    try {
        const data = await ddb.send(new ScanCommand({
            TableName: "ExamAttempts"
        }));

        res.json(data.Items || []);
    } catch (error) {
        console.error("Get all attempts error:", error);
        res.status(500).json({ error: "Failed to fetch exam attempts" });
    }
};
