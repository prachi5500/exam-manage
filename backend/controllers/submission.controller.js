import { ddb } from "../config/dynamo.js";
import { ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

export const getAllSubmissions = async (req, res) => {
  const data = await ddb.send(
    new ScanCommand({ TableName: "ExamSubmissions" })
  );
  res.json(data.Items || []);
};

export const deleteSubmission = async (req, res) => {
  await ddb.send(
    new DeleteCommand({
      TableName: "ExamSubmissions",
      Key: { submissionId: req.params.id }
    })
  );
  res.json({ success: true });
};
