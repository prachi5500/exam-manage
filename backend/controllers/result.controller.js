// import { ddb } from "../config/dynamo.js";
import { docClient as ddb } from "../config/awsConfig.js";  // docClient is the DocumentClient
import { ScanCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuid } from "uuid";

export const getAllResults = async (req, res) => {
    try {
        const data = await ddb.send(new ScanCommand({ TableName: "Results" }));
        res.json(data.Items || []);
    } catch (error) {
        res.status(500).json({ error: "Failed to get results" });
    }
};

export const getUserResults = async (req, res) => {
    try {
        // Scan all results and filter client-side to avoid FilterExpression issues
        const data = await ddb.send(
            new ScanCommand({
                TableName: "Results"
            })
        );
        const userResults = (data.Items || []).filter(item => item.userId === req.user.userId);
        res.json(userResults);
    } catch (error) {
        console.error("Get user results error:", error);
        res.status(500).json({ error: "Failed to get user results", details: error.message });
    }
};

export const addResult = async (req, res) => {
    try {
        const item = { resultId: uuid(), ...req.body, userId: req.user.userId, createdAt: Date.now() };
        await ddb.send(new PutCommand({ TableName: "Results", Item: item }));
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: "Failed to add result" });
    }
};

export const deleteResult = async (req, res) => {
    try {
        await ddb.send(new DeleteCommand({ TableName: "Results", Key: { resultId: req.params.id } }));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete result" });
    }
};