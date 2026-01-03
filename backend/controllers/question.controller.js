// import { ddb } from "../config/dynamo.js";
import { docClient as ddb } from "../config/awsConfig.js";  // docClient is the DocumentClient
import { ScanCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuid } from "uuid";

// export const getQuestions = async (req, res) => {
//   const { subject } = req.query;

//   const data = await ddb.send(
//     new ScanCommand({
//       TableName: "Questions",
//       FilterExpression: "subject = :s",
//       ExpressionAttributeValues: { ":s": subject }
//     })
//   );

//   res.json(data.Items || []);
// };
export const getQuestions = async (req, res) => {
  try {
    const { subject } = req.query;

    console.log("🔍 Requested subject from query:", subject); // ← Ye add karo
    console.log("🔍 Type of subject:", typeof subject);

    if (!subject) {
      return res.status(400).json({ message: "Subject is required" });
    }

    const params = {
      TableName: "Questions",
      FilterExpression: "subject = :s",
      ExpressionAttributeValues: { ":s": subject.trim().toLowerCase() } // trim spaces
    };

    console.log("🔍 DynamoDB Scan params:", params); // ← Ye bhi add karo

    const data = await ddb.send(new ScanCommand(params));

    console.log(`✅ Fetched ${data.Items?.length || 0} questions for subject: "${subject}"`);

    res.json(data.Items || []);
  } catch (error) {
    console.error("🔥 Get questions error:", error);
    res.status(500).json({ error: "Failed to fetch questions", details: error.message });
  }
};

export const addQuestion = async (req, res) => {
  const item = {
    id: uuid(),
    subject: req.body.subject?.trim().toLowerCase(),
    type: req.body.type,
    question: req.body.question,
    options: req.body.options || [],
    initialCode: req.body.initialCode || '',
    createdBy: req.user.userId, // 👈 MongoDB userId
    createdAt: Date.now()
  };

  await ddb.send(
    new PutCommand({
      TableName: "Questions",
      Item: item
    })
  );

  res.json(item);
};

export const deleteQuestion = async (req, res) => {
  await ddb.send(
    new DeleteCommand({
      TableName: "Questions",
      Key: { id: req.params.id }
    })
  );

  res.json({ success: true });
};
