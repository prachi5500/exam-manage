import { DynamoDBClient, CreateTableCommand } from "@aws-sdk/client-dynamodb";
import dotenv from 'dotenv';

dotenv.config();

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

async function createTable() {
    try {
        await client.send(new CreateTableCommand({
            TableName: "Subjects",
            KeySchema: [
                { AttributeName: "id", KeyType: "HASH" }
            ],
            AttributeDefinitions: [
                { AttributeName: "id", AttributeType: "S" }
            ],
            BillingMode: "PAY_PER_REQUEST"
        }));
        console.log("✅ Subjects table created successfully!");
    } catch (error) {
        if (error.name === "ResourceInUseException") {
            console.log("⚠️ Subjects table already exists – no problem!");
        } else {
            console.error("❌ Error creating table:", error.message);
        }
    }
}

createTable();