import { ddb } from "../config/dynamo.js";
import { ScanCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuid } from "uuid";

export const getQuestions = async (req, res) => {
  const { subject } = req.query;

  const data = await ddb.send(
    new ScanCommand({
      TableName: "Questions",
      FilterExpression: "subject = :s",
      ExpressionAttributeValues: { ":s": subject }
    })
  );

  res.json(data.Items || []);
};

export const addQuestion = async (req, res) => {
  const item = {
    id: uuid(),
    subject: req.body.subject,
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
