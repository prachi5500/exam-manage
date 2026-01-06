// import { ddb } from "../config/dynamo.js";
import { docClient as ddb, s3Client } from "../config/awsConfig.js";  // docClient is the DocumentClient
import { PutObjectCommand } from "@aws-sdk/client-s3";
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
      UpdateExpression: "SET #status = :approved, evaluatedAt = :now, #score = :score, feedback = :feedback, evaluatedBy = :evalBy",
      ExpressionAttributeValues: {
        ":approved": "approved",
        ":now": Date.now(),
        ":score": resultItem.score,
        ":feedback": resultItem.feedback,
        ":evalBy": resultItem.evaluatedBy
      },
      ExpressionAttributeNames: { "#status": "status", "#score": "score" }
    }));

    // Backup updated submission to S3 (best-effort)
    try {
      const updated = await ddb.send(new GetCommand({ TableName: "ExamSubmissions", Key: { submissionId } }));
      if (updated.Item && process.env.S3_BUCKET_NAME) {
        const key = `submissions/${submissionId}.json`;
        await s3Client.send(new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: key,
          Body: JSON.stringify(updated.Item),
          ContentType: 'application/json',
          Metadata: {
            uploadedby: updated.Item.userId || '',
            uploadedbyname: updated.Item.userName || ''
          }
        }));
      }
    } catch (s3err) {
      console.error('Failed to backup evaluated submission to S3', s3err.message);
    }

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

    let enriched = await attachUserNames(pending);
    enriched = await attachPaperDetails(enriched);
    res.json(enriched);
  } catch (error) {
    console.error("Get pending submissions error:", error);
    res.status(500).json({ error: "Failed to fetch pending submissions", details: error.message });
  }
};

export const getAllSubmissions = async (req, res) => {
  try {
    const data = await ddb.send(new ScanCommand({ TableName: "ExamSubmissions" }));
    let enriched = await attachUserNames(data.Items || []);
    enriched = await attachPaperDetails(enriched);
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
    // Ensure the returned submissions include the user's name and paper snapshot
    let enriched = await attachUserNames(userSubmissions);
    enriched = await attachPaperDetails(enriched);
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

// Helper: attach paper snapshot (paper metadata + full question objects) when missing
const attachPaperDetails = async (items) => {
  if (!items || !items.length) return items;
  const out = [...items];

  for (let i = 0; i < out.length; i++) {
    const it = out[i];
    if (it.paper && it.paper.questions) continue; // already has snapshot
    if (!it.paperId && !it.paper?.paperId) continue;

    const paperId = it.paper?.paperId || it.paperId;
    try {
      const paperRes = await ddb.send(new GetCommand({ TableName: 'QuestionPapers', Key: { paperId } }));
      if (!paperRes.Item) continue;
      const paper = paperRes.Item;
      const questions = await Promise.all(
        (paper.questionIds || []).map(qId =>
          ddb.send(new GetCommand({ TableName: 'Questions', Key: { id: qId } })).then(r => r.Item).catch(() => null)
        )
      );
      it.paper = {
        paperId: paper.paperId,
        title: paper.title,
        durationMinutes: paper.durationMinutes,
        questions: questions.filter(q => q !== null)
      };
    } catch (e) {
      console.error('attachPaperDetails error for', paperId, e.message || e);
      // continue without failing
    }
  }

  return out;
};