import { ddb } from "../config/dynamo.js";
import { ScanCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuid } from "uuid";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

export const evaluateSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { scores } = req.body;  // {questionId1: 10, questionId2: 5, ...}
    const totalScore = Object.values(scores).reduce((sum, score) => sum + Number(score), 0);

    // Get submission
    const submissionData = await ddb.send(new GetCommand({ TableName: "ExamSubmissions", Key: { submissionId } }));
    if (!submissionData.Item) return res.status(404).json({ error: "Submission not found" });

    const resultItem = {
      resultId: uuid(),
      userId: submissionData.Item.userId,
      subject: submissionData.Item.subject,
      score: totalScore,
      details: scores,  // Per-question scores
      evaluatedAt: Date.now(),
      evaluator: req.user.userId
    };

    await ddb.send(new PutCommand({ TableName: "Results", Item: resultItem }));

    // Optional: Mark submission as evaluated
    await ddb.send(new UpdateCommand({
      TableName: "ExamSubmissions",
      Key: { submissionId },
      UpdateExpression: "set evaluated = :true",
      ExpressionAttributeValues: { ":true": true }
    }));

    res.json({ success: true, result: resultItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to evaluate" });
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