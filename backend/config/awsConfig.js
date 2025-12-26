// import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
// import { S3Client } from "@aws-sdk/client-s3";
// import dotenv from 'dotenv';


// dotenv.config();

// // DynamoDB Configuration
// const dynamoDBClient = new DynamoDBClient({
//     region: process.env.AWS_REGION || "ap-south-1",
//     credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     }
// });

// const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

// // S3 Configuration
// const s3Client = new S3Client({
//     region: process.env.AWS_REGION || "ap-south-1",
//     credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     }
// });

// export { docClient, s3Client };


import { DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';

dotenv.config();

// Validate AWS credentials
const validateAWSCredentials = () => {
    const requiredEnvVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        console.warn(`⚠️ Missing AWS environment variables: ${missingVars.join(', ')}`);
        console.warn('Using local development configuration...');
        return false;
    }
    return true;
};

const hasValidCredentials = validateAWSCredentials();

// DynamoDB Configuration
const dynamoDBConfig = {
    region: process.env.AWS_REGION || "us-east-1"
};

// Add credentials only if they exist
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    dynamoDBConfig.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
}

const dynamoDBClient = new DynamoDBClient(dynamoDBConfig);

// Create DynamoDB Document Client with marshalling options
const marshallOptions = {
    convertEmptyValues: false,
    removeUndefinedValues: true,
    convertClassInstanceToMap: false,
};

const unmarshallOptions = {
    wrapNumbers: false,
};

const translateConfig = { marshallOptions, unmarshallOptions };

const docClient = DynamoDBDocumentClient.from(dynamoDBClient, translateConfig);

// S3 Configuration
const s3Config = {
    region: process.env.AWS_REGION || "us-east-1"
};

// Add credentials only if they exist
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    s3Config.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
}

const s3Client = new S3Client(s3Config);

// AWS Service health check
export const checkAWSConnection = async () => {
    try {
        if (!hasValidCredentials) {
            return {
                dynamodb: { connected: false, message: 'AWS credentials not configured' },
                s3: { connected: false, message: 'AWS credentials not configured' }
            };
        }

        // Check S3 connection by listing buckets (or a simple operation)
        const s3Check = new Promise(async (resolve) => {
            try {
                // Try to list buckets to check connection
                const command = new ListBucketsCommand({});
                await s3Client.send(command);
                resolve({ connected: true, message: 'Connected to S3' });
            } catch (error) {
                resolve({ connected: false, message: error.message });
            }
        });

        // Check DynamoDB connection
        const dynamoDBCheck = new Promise(async (resolve) => {
            try {
                // Try to list tables to check connection
                const command = new ListTablesCommand({});
                await dynamoDBClient.send(command);
                resolve({ connected: true, message: 'Connected to DynamoDB' });
            } catch (error) {
                resolve({ connected: false, message: error.message });
            }
        });

        const [s3Status, dynamodbStatus] = await Promise.all([s3Check, dynamoDBCheck]);
        
        return {
            s3: s3Status,
            dynamodb: dynamodbStatus,
            configured: hasValidCredentials
        };
    } catch (error) {
        return {
            s3: { connected: false, message: error.message },
            dynamodb: { connected: false, message: error.message },
            configured: hasValidCredentials
        };
    }
};

export { docClient, s3Client, dynamoDBClient };