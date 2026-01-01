import { ddb } from "../config/dynamo.js"; // This should be DynamoDBDocumentClient
import { ScanCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuid } from "uuid";

export const getSubjects = async (req, res) => {
    try {
        const data = await ddb.send(new ScanCommand({ TableName: "Subjects" }));
        res.json(data.Items || []);
    } catch (error) {
        console.error("🔥 Get subjects error:", error.message || error);
        res.status(500).json({ success: false, message: "Failed to fetch subjects", error: error.message });
    }
};

export const addSubject = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: "Subject name is required" });
        }

        const normalizedName = name.trim().toLowerCase().replace(/\s+/g, '-'); // e.g., "Data Science" → "data-science"

        const item = {
            id: uuid(),           // ← Native string
            name: normalizedName, // ← Native string
            createdAt: Date.now() // ← Native number
        };

        await ddb.send(new PutCommand({
            TableName: "Subjects",
            Item: item
        }));

        res.status(201).json(item);
    } catch (error) {
        console.error("🔥 Add subject error:", error.message || error);
        res.status(500).json({
            success: false,
            message: "Failed to add subject",
            error: error.message
        });
    }
};

export const deleteSubject = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ success: false, message: "Subject ID required" });
        }

        await ddb.send(new DeleteCommand({
            TableName: "Subjects",
            Key: { id } // Native string
        }));

        res.json({ success: true, message: "Subject deleted" });
    } catch (error) {
        console.error("🔥 Delete subject error:", error.message || error);
        res.status(500).json({ success: false, message: "Failed to delete subject" });
    }
};