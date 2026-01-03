# 🗄️ AWS DynamoDB Setup Guide

## Prerequisites
- AWS Account
- AWS CLI configured
- Credentials set in `.env` file

## Tables to Create

### 1. Subjects Table

**Name**: `Subjects`

**Primary Key**:
- Partition Key: `id` (String)

**Attributes**:
```
id (String) - Unique identifier
name (String) - Subject name (e.g., "javascript", "python")
createdAt (Number) - Unix timestamp
```

**Settings**:
- Billing Mode: Pay-per-request
- No Global Secondary Indexes needed

---

### 2. Questions Table

**Name**: `Questions`

**Primary Key**:
- Partition Key: `id` (String)

**Attributes**:
```
id (String) - Unique question ID
subject (String) - Subject name
type (String) - "mcq", "theory", or "coding"
question (String) - Question text
options (List<String>) - Answer options (for MCQ)
initialCode (String) - Starter code (for coding)
createdBy (String) - Admin's MongoDB user ID
createdAt (Number) - Unix timestamp
```

**Global Secondary Index (GSI)**:
- Name: `subject-index`
- Partition Key: `subject`
- Billing: Pay-per-request

**Settings**:
- Billing Mode: Pay-per-request

---

### 3. QuestionPapers Table

**Name**: `QuestionPapers`

**Primary Key**:
- Partition Key: `paperId` (String)

**Attributes**:
```
paperId (String) - Unique paper ID
subject (String) - Subject name
title (String) - Paper title (e.g., "Paper 1", "Midterm")
questionIds (List<String>) - Array of question IDs
status (String) - "active" or "archived"
createdBy (String) - Admin's MongoDB user ID
createdAt (Number) - Unix timestamp
updatedAt (Number) - Last updated timestamp
```

**Global Secondary Index (GSI)**:
- Name: `subject-index`
- Partition Key: `subject`
- Billing: Pay-per-request

**Settings**:
- Billing Mode: Pay-per-request

---

### 4. ExamAttempts Table

**Name**: `ExamAttempts`

**Primary Key**:
- Partition Key: `examAttemptId` (String)

**Attributes**:
```
examAttemptId (String) - Unique exam attempt ID
userId (String) - Student's MongoDB user ID
subject (String) - Subject name
paperId (String) - Assigned question paper ID
status (String) - "in-progress" or "submitted"
answers (Map) - Student's answers {questionId: answer}
startedAt (Number) - When exam started
submittedAt (Number) - When exam submitted (null if in-progress)
```

**Global Secondary Index (GSI)**:
- Name: `userId-subject-index`
- Partition Key: `userId`
- Sort Key: `subject`
- Billing: Pay-per-request

**Settings**:
- Billing Mode: Pay-per-request
- TTL: Optional (set to 30 days to auto-delete old records)

---

### 5. ExamSubmissions Table

**Name**: `ExamSubmissions`

**Primary Key**:
- Partition Key: `submissionId` (String)

**Attributes**:
```
submissionId (String) - Unique submission ID
userId (String) - Student's MongoDB user ID
subject (String) - Subject name
examAttemptId (String) - Related exam attempt ID
paperId (String) - Question paper ID
answers (Map) - Final submitted answers
submittedAt (Number) - Submission timestamp
autoSubmit (Boolean) - Auto-submitted flag
status (String) - "submitted"
```

**Global Secondary Index (GSI)**:
- Name: `userId-index`
- Partition Key: `userId`
- Billing: Pay-per-request

**Settings**:
- Billing Mode: Pay-per-request

---

### 6. Results Table

**Name**: `Results`

**Primary Key**:
- Partition Key: `resultId` (String)

**Attributes**:
```
resultId (String) - Unique result ID
userId (String) - Student's MongoDB user ID
subject (String) - Subject name
submissionId (String) - Related submission ID
score (Number) - Total score
details (Map) - Per-question scores {questionId: score}
evaluatedAt (Number) - Evaluation timestamp
evaluator (String) - Admin's user ID who evaluated
```

**Global Secondary Index (GSI)**:
- Name: `userId-index`
- Partition Key: `userId`
- Billing: Pay-per-request

**Settings**:
- Billing Mode: Pay-per-request

---

## AWS CLI Commands

### Create Tables Using AWS CLI

```bash
# 1. Create Subjects Table
aws dynamodb create-table \
  --table-name Subjects \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-south-1

# 2. Create Questions Table
aws dynamodb create-table \
  --table-name Questions \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=subject,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=subject-index,\
KeySchema=['{AttributeName=subject,KeyType=HASH}'],\
Projection='{ProjectionType=ALL}',\
BillingMode=PAY_PER_REQUEST \
  --billing-mode PAY_PER_REQUEST \
  --region ap-south-1

# 3. Create QuestionPapers Table
aws dynamodb create-table \
  --table-name QuestionPapers \
  --attribute-definitions \
    AttributeName=paperId,AttributeType=S \
    AttributeName=subject,AttributeType=S \
  --key-schema \
    AttributeName=paperId,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=subject-index,\
KeySchema=['{AttributeName=subject,KeyType=HASH}'],\
Projection='{ProjectionType=ALL}',\
BillingMode=PAY_PER_REQUEST \
  --billing-mode PAY_PER_REQUEST \
  --region ap-south-1

# 4. Create ExamAttempts Table
aws dynamodb create-table \
  --table-name ExamAttempts \
  --attribute-definitions \
    AttributeName=examAttemptId,AttributeType=S \
    AttributeName=userId,AttributeType=S \
    AttributeName=subject,AttributeType=S \
  --key-schema \
    AttributeName=examAttemptId,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=userId-subject-index,\
KeySchema=['{AttributeName=userId,KeyType=HASH}','{AttributeName=subject,KeyType=RANGE}'],\
Projection='{ProjectionType=ALL}',\
BillingMode=PAY_PER_REQUEST \
  --billing-mode PAY_PER_REQUEST \
  --region ap-south-1

# 5. Create ExamSubmissions Table
aws dynamodb create-table \
  --table-name ExamSubmissions \
  --attribute-definitions \
    AttributeName=submissionId,AttributeType=S \
    AttributeName=userId,AttributeType=S \
  --key-schema \
    AttributeName=submissionId,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=userId-index,\
KeySchema=['{AttributeName=userId,KeyType=HASH}'],\
Projection='{ProjectionType=ALL}',\
BillingMode=PAY_PER_REQUEST \
  --billing-mode PAY_PER_REQUEST \
  --region ap-south-1

# 6. Create Results Table
aws dynamodb create-table \
  --table-name Results \
  --attribute-definitions \
    AttributeName=resultId,AttributeType=S \
    AttributeName=userId,AttributeType=S \
  --key-schema \
    AttributeName=resultId,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=userId-index,\
KeySchema=['{AttributeName=userId,KeyType=HASH}'],\
Projection='{ProjectionType=ALL}',\
BillingMode=PAY_PER_REQUEST \
  --billing-mode PAY_PER_REQUEST \
  --region ap-south-1
```

---

## AWS Management Console (Manual Setup)

### Step-by-Step Instructions:

1. **Go to AWS Console** → Search "DynamoDB"

2. **Click "Create Table"**

3. **For each table**:
   - Enter Table name (e.g., "Subjects")
   - Set Partition key and type
   - Choose "Billing mode: Pay-per-request"
   - Click "Create"

4. **Add Global Secondary Indexes** (if needed):
   - Go to table → Indexes tab
   - Click "Create index"
   - Set partition key and billing
   - Wait for creation

---

## Verify Tables Are Created

```bash
# List all DynamoDB tables
aws dynamodb list-tables --region ap-south-1

# Describe specific table
aws dynamodb describe-table --table-name Subjects --region ap-south-1
```

---

## Sample Data for Testing

### Add a Subject:
```json
{
  "id": "js-001",
  "name": "javascript",
  "createdAt": 1704273600
}
```

### Add a Question:
```json
{
  "id": "q-001",
  "subject": "javascript",
  "type": "mcq",
  "question": "What is JavaScript?",
  "options": ["Language", "Framework", "Database", "Library"],
  "createdBy": "admin-user-id",
  "createdAt": 1704273600
}
```

### Add a Question Paper:
```json
{
  "paperId": "paper-001",
  "subject": "javascript",
  "title": "Paper 1",
  "questionIds": ["q-001", "q-002", "q-003"],
  "status": "active",
  "createdBy": "admin-user-id",
  "createdAt": 1704273600,
  "updatedAt": 1704273600
}
```

---

## Monitoring

### Check Table Metrics:
- AWS Console → DynamoDB → Table → Metrics
- Monitor read/write capacity
- Check for errors or throttling

### Cost Estimation:
- Pay-per-request: $1.25 per million write units, $0.25 per million read units
- Estimated for typical exam system: $10-50/month

---

## Backup & Recovery

### Enable Point-in-Time Recovery:
```bash
aws dynamodb update-continuous-backups \
  --table-name Subjects \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true \
  --region ap-south-1
```

### Manual Backups:
```bash
# Create backup
aws dynamodb create-backup \
  --table-name Subjects \
  --backup-name subjects-backup-2024-01-03 \
  --region ap-south-1
```

---

## Performance Tips

1. **Use appropriate partition keys** to avoid hot partitions
2. **Enable auto-scaling** if using provisioned mode (optional)
3. **Monitor CloudWatch metrics** for performance issues
4. **Use batch operations** for multiple items
5. **Set TTL** on temporary data to auto-delete

---

**Status**: ✅ DynamoDB Setup Ready

**Next Step**: Start backend and create tables

**Last Updated**: January 3, 2026
