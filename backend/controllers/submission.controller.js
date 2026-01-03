// import { ddb } from "../config/dynamo.js";
import { docClient as ddb } from "../config/awsConfig.js";  // docClient is the DocumentClient
import { ScanCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuid } from "uuid";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

export const evaluateSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { score, feedback } = req.body;  // score: total marks, feedback: optional string

    // Get submission
    const submissionData = await ddb.send(new GetCommand({ TableName: "ExamSubmissions", Key: { submissionId } }));
    if (!submissionData.Item) return res.status(404).json({ error: "Submission not found" });

    const submission = submissionData.Item;

    const resultItem = {
      resultId: uuid(),
      userId: submission.userId,
      submissionId,
      subject: submission.subject,
      score: score || 0,
      feedback: feedback || "",
      evaluatedAt: Date.now(),
      evaluatedBy: req.user.userId,
      status: "approved"
    };

    await ddb.send(new PutCommand({ TableName: "Results", Item: resultItem }));

    await ddb.send(new UpdateCommand({
      TableName: "ExamSubmissions",
      Key: { submissionId },
      UpdateExpression: "SET #status = :approved, evaluatedAt = :now",
      ExpressionAttributeValues: {
        ":approved": "approved",
        ":now": Date.now()
      },
      ExpressionAttributeNames: { "#status": "status" }
    }));

    res.json({ success: true, result: resultItem });
  } catch (error) {
    console.error("Evaluate submission error:", error);
    res.status(500).json({ error: "Failed to evaluate submission", details: error.message });
  }
};

export const getPendingSubmissions = async (req, res) => {
  try {
    const data = await ddb.send(new ScanCommand({
      TableName: "ExamSubmissions"
    }));

    // Filter for pending submissions (not yet evaluated)
    const pending = (data.Items || []).filter(item =>
      item.status === "submitted" || item.status === "pending"
    );

    res.json(pending);
  } catch (error) {
    console.error("Get pending submissions error:", error);
    res.status(500).json({ error: "Failed to fetch pending submissions", details: error.message });
  }
};

export const getAllSubmissions = async (req, res) => {
  try {
    const data = await ddb.send(new ScanCommand({ TableName: "ExamSubmissions" }));
    res.json(data.Items || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
};

export const getUserSubmissions = async (req, res) => {
  try {
    const data = await ddb.send(
      new ScanCommand({
        TableName: "ExamSubmissions",
        IndexName: "userId-index",
        FilterExpression: "userId = :u",
        ExpressionAttributeValues: { ":u": req.user.userId }
      })
    );
    res.json(data.Items || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user submissions" });
  }
};

export const postSubmission = async (req, res) => {
  try {
    const item = {
      submissionId: uuid(),
      userId: req.user.userId,
      submittedAt: Date.now(),
      ...req.body
    };
    await ddb.send(new PutCommand({ TableName: "ExamSubmissions", Item: item }));
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save submission" });
  }
};

export const deleteSubmission = async (req, res) => {
  try {
    await ddb.send(
      new DeleteCommand({
        TableName: "ExamSubmissions",
        Key: { submissionId: req.params.id }
      })
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete submission" });
  }
};