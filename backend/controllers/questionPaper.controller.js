import { docClient as ddb } from "../config/awsConfig.js";
import { ScanCommand, PutCommand, DeleteCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuid } from "uuid";

// Create a question paper (collection of questions for a specific subject)
export const createQuestionPaper = async (req, res) => {
    try {
        const { subject, title, questionIds, durationMinutes } = req.body;

        if (!subject || !title || !questionIds || questionIds.length === 0) {
            return res.status(400).json({ success: false, message: "Subject, title, and questions are required" });
        }

        if (!durationMinutes || durationMinutes <= 0) {
            return res.status(400).json({ success: false, message: "Duration (in minutes) must be greater than 0" });
        }

        const paperId = uuid();
        const paper = {
            paperId,
            subject: subject.trim().toLowerCase(),
            title,
            questionIds,  // Array of question IDs
            durationMinutes: parseInt(durationMinutes),
            createdBy: req.user.userId,
            createdAt: Date.now(),
            status: "active"
        };

        await ddb.send(new PutCommand({
            TableName: "QuestionPapers",
            Item: paper
        }));

        res.status(201).json({ success: true, paper });
    } catch (error) {
        console.error("Create paper error:", error);
        res.status(500).json({ success: false, message: "Failed to create question paper", error: error.message });
    }
};

// Get all question papers for a subject
export const getQuestionPapersBySubject = async (req, res) => {
    try {
        const { subject } = req.query;

        if (!subject) {
            return res.status(400).json({ message: "Subject is required" });
        }

        // Avoid using FilterExpression to sidestep ExpressionAttributeValues marshalling issues
        const data = await ddb.send(new ScanCommand({ TableName: "QuestionPapers" }));
        const items = (data.Items || []).filter(it => (it.subject || '').toString().trim().toLowerCase() === subject.trim().toLowerCase());

        res.json(items);
    } catch (error) {
        console.error("Get papers error:", error);
        res.status(500).json({ error: "Failed to fetch question papers", details: error.message });
    }
};

// Get a specific question paper with all its questions
export const getQuestionPaperDetails = async (req, res) => {
    try {
        const { paperId } = req.params;

        const paperData = await ddb.send(new GetCommand({
            TableName: "QuestionPapers",
            Key: { paperId }
        }));

        if (!paperData.Item) {
            return res.status(404).json({ error: "Question paper not found" });
        }

        // Fetch all questions for this paper
        const paper = paperData.Item;
        const questions = await Promise.all(
            (paper.questionIds || []).map(qId =>
                ddb.send(new GetCommand({
                    TableName: "Questions",
                    Key: { id: qId }
                })).then(res => res.Item).catch(() => null)
            )
        );

        res.json({
            ...paper,
            questions: questions.filter(q => q !== null)
        });
    } catch (error) {
        console.error("Get paper details error:", error);
        res.status(500).json({ error: "Failed to fetch question paper details" });
    }
};

// Delete a question paper
export const deleteQuestionPaper = async (req, res) => {
    try {
        const { paperId } = req.params;

        await ddb.send(new DeleteCommand({
            TableName: "QuestionPapers",
            Key: { paperId }
        }));

        res.json({ success: true, message: "Question paper deleted" });
    } catch (error) {
        console.error("Delete paper error:", error);
        res.status(500).json({ error: "Failed to delete question paper" });
    }
};

// Update question paper
export const updateQuestionPaper = async (req, res) => {
    try {
        const { paperId } = req.params;
        const { title, questionIds, status } = req.body;

        const updateExpression = [];
        const expressionAttributeValues = {};

        if (title) {
            updateExpression.push("title = :title");
            expressionAttributeValues[":title"] = title;
        }
        if (questionIds) {
            updateExpression.push("questionIds = :qIds");
            expressionAttributeValues[":qIds"] = questionIds;
        }
        if (status) {
            updateExpression.push("#status = :status");
            expressionAttributeValues[":status"] = status;
        }
        updateExpression.push("updatedAt = :updatedAt");
        expressionAttributeValues[":updatedAt"] = Date.now();

        if (updateExpression.length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        await ddb.send(new UpdateCommand({
            TableName: "QuestionPapers",
            Key: { paperId },
            UpdateExpression: "SET " + updateExpression.join(", "),
            ExpressionAttributeValues: expressionAttributeValues,
            ExpressionAttributeNames: { "#status": "status" }
        }));

        res.json({ success: true, message: "Question paper updated" });
    } catch (error) {
        console.error("Update paper error:", error);
        res.status(500).json({ error: "Failed to update question paper" });
    }
};

