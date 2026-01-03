import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb';
import dotenv from 'dotenv';

dotenv.config();

const dynamoDB = new DynamoDBClient({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Tables (added Subjects, QuestionPapers, ExamAttempts)
const tables = [
    {
        TableName: 'Exams',
        KeySchema: [{ AttributeName: 'examId', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'examId', AttributeType: 'S' }],
        BillingMode: 'PAY_PER_REQUEST'
    },
    {
        TableName: 'Questions',
        KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
        BillingMode: 'PAY_PER_REQUEST'
    },
    {
        TableName: 'ExamSubmissions',
        KeySchema: [{ AttributeName: 'submissionId', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'submissionId', AttributeType: 'S' }],
        BillingMode: 'PAY_PER_REQUEST'
    },
    {
        TableName: 'Results',
        KeySchema: [{ AttributeName: 'resultId', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'resultId', AttributeType: 'S' }],
        BillingMode: 'PAY_PER_REQUEST'
    },
    {
        TableName: 'Subjects',
        KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
        BillingMode: 'PAY_PER_REQUEST'
    },
    {
        TableName: 'QuestionPapers',
        KeySchema: [{ AttributeName: 'paperId', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'paperId', AttributeType: 'S' }],
        BillingMode: 'PAY_PER_REQUEST'
    },
    {
        TableName: 'ExamAttempts',
        KeySchema: [{ AttributeName: 'examAttemptId', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'examAttemptId', AttributeType: 'S' }],
        BillingMode: 'PAY_PER_REQUEST'
    }
];

async function createTable(tableConfig) {
    try {
        await dynamoDB.send(new CreateTableCommand(tableConfig));
        console.log(`✅ Table "${tableConfig.TableName}" created`);
        return true;
    } catch (error) {
        if (error.name === 'ResourceInUseException') {
            console.log(`⚠️ Table "${tableConfig.TableName}" already exists`);
            return true;
        } else {
            console.error(`❌ Error creating "${tableConfig.TableName}":`, error.message);
            return false;
        }
    }
}

async function setupTables() {
    console.log('🔨 Creating DynamoDB Tables...');
    console.log('='.repeat(50));

    let successCount = 0;

    for (const tableConfig of tables) {
        const success = await createTable(tableConfig);
        if (success) successCount++;
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Setup Summary:');
    console.log(`✅ Successfully created/verified: ${successCount} tables`);
    console.log(`📋 Total tables needed: ${tables.length}`);

    if (successCount === tables.length) {
        console.log('\n🎉 All tables are ready!');
        console.log('\n📝 Next Steps:');
        console.log('1. ✅ Run addGSI.js to add Global Secondary Indexes');
        console.log('2. ✅ Run testDynamoDB.js to verify');
        console.log('3. ✅ Start your backend server');
    } else {
        console.log('\n⚠️  Some tables failed to create.');
        console.log('👉 Check AWS Console → DynamoDB for existing tables');
    }
}

setupTables();