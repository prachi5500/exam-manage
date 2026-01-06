// import { ddb } from "../config/dynamo.js";
import { docClient as ddb } from "../config/awsConfig.js";  // docClient is the DocumentClient
import { ScanCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuid } from "uuid";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Usermodel } from "../models/User.js";

// Helper: given array of submission items, attach `userName` by querying MongoDB when missing
const attachUserNames = async (items) => {
  if (!items || !items.length) return items;
  const out = [...items];
  // collect unique userIds that need lookup
  const needLookup = new Set();
  out.forEach(it => {
    if (!it.userName && it.userId) needLookup.add(it.userId);
  });

  if (needLookup.size === 0) return out;

  const ids = Array.from(needLookup);
  // Bulk fetch users
  const users = await Usermodel.find({ _id: { $in: ids } }).select('name').lean();
  const nameMap = {};
  users.forEach(u => { nameMap[u._id.toString()] = u.name; });

  return out.map(it => ({
    ...it,
    userName: it.userName || nameMap[it.userId] || null
  }));
};

export const evaluateSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { score, feedback } = req.body;  // score: total marks, feedback: optional string

    // Get submission
    const submissionData = await ddb.send(new GetCommand({ TableName: "ExamSubmissions", Key: { submissionId } }));
    if (!submissionData.Item) return res.status(404).json({ error: "Submission not found" });

    const submission = submissionData.Item;

    // Try to determine student name for result records
    let studentName = submission.userName;
    if (!studentName) {
      try {
        const user = await Usermodel.findById(submission.userId).select('name');
        studentName = user?.name;
      } catch (e) {
        // ignore lookup failure
      }
    }

    const resultItem = {
      resultId: uuid(),
      userId: submission.userId,
      studentName: studentName || null,
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

    const enriched = await attachUserNames(pending);

    res.json(enriched);
  } catch (error) {
    console.error("Get pending submissions error:", error);
    res.status(500).json({ error: "Failed to fetch pending submissions", details: error.message });
  }
};

export const getAllSubmissions = async (req, res) => {
  try {
    const data = await ddb.send(new ScanCommand({ TableName: "ExamSubmissions" }));
    const enriched = await attachUserNames(data.Items || []);
    res.json(enriched);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
};

export const getUserSubmissions = async (req, res) => {
  try {
    console.log('Fetching submissions for userId:', req.user.userId);

    // Scan all submissions and filter in code to avoid index issues
    const data = await ddb.send(
      new ScanCommand({
        TableName: "ExamSubmissions"
      })
    );

    const userSubmissions = (data.Items || []).filter(item =>
      item.userId === req.user.userId
    );

    console.log('Found submissions:', userSubmissions.length);
    // Ensure the returned submissions include the user's name
    const enriched = await attachUserNames(userSubmissions);
    res.json(enriched);
  } catch (error) {
    console.error('Get user submissions error:', error);
    res.status(500).json({ error: "Failed to fetch user submissions", details: error.message });
  }
};

export const postSubmission = async (req, res) => {
  try {
    const item = {
      submissionId: uuid(),
      userId: req.user.userId,
      userName: req.user.name || undefined,
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