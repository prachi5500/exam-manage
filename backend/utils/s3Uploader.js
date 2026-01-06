import multer from 'multer';
import multerS3 from 'multer-s3';
import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl as generatePresignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from '../config/awsConfig.js';
import dotenv from 'dotenv';

dotenv.config();

// Validate S3 configuration
const validateS3Config = () => {
    if (!process.env.S3_BUCKET_NAME) {
        console.warn('⚠️ S3_BUCKET_NAME not configured. File uploads will fail.');
        return false;
    }
    return true;
};

const hasValidS3Config = validateS3Config();

// Allowed file types and their MIME types
const ALLOWED_FILE_TYPES = {
    // Documents
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'text/plain': ['.txt'],

    // Images
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],

    // Archives
    'application/zip': ['.zip'],
    'application/x-rar-compressed': ['.rar'],

    // Spreadsheets
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
};

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
    image: 5 * 1024 * 1024, // 5MB
    document: 10 * 1024 * 1024, // 10MB
    default: 50 * 1024 * 1024 // 50MB
};

// Helper function to get file category
const getFileCategory = (mimetype) => {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.includes('pdf') || mimetype.includes('word') || mimetype.includes('text')) return 'document';
    return 'other';
};

// File filter function
const fileFilter = (req, file, cb) => {
    try {
        // Check if file type is allowed
        if (!ALLOWED_FILE_TYPES[file.mimetype]) {
            return cb(new Error(`File type not allowed. Allowed types: ${Object.keys(ALLOWED_FILE_TYPES).map(type => type.split('/')[1]).join(', ')}`), false);
        }

        // Check file size based on category
        const category = getFileCategory(file.mimetype);
        const sizeLimit = FILE_SIZE_LIMITS[category] || FILE_SIZE_LIMITS.default;

        if (req.headers['content-length'] > sizeLimit) {
            return cb(new Error(`File size too large. Maximum size for ${category} files is ${sizeLimit / (1024 * 1024)}MB`), false);
        }

        // Check file extension
        const allowedExtensions = ALLOWED_FILE_TYPES[file.mimetype];
        const fileExtension = '.' + file.originalname.split('.').pop().toLowerCase();

        if (!allowedExtensions.includes(fileExtension)) {
            return cb(new Error(`Invalid file extension for ${file.mimetype}. Allowed extensions: ${allowedExtensions.join(', ')}`), false);
        }

        cb(null, true);
    } catch (error) {
        cb(error, false);
    }
};

// Generate unique file key
const generateFileKey = (req, file) => {
    const folder = req.body.folder || req.query.folder || 'uploads';
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const safeFileName = file.originalname
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/\s+/g, '_');

    return `${folder}/${timestamp}_${randomString}_${safeFileName}`;
};

// Configure multer for S3
export const upload = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: process.env.S3_BUCKET_NAME || 'temp-bucket',
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: (req, file, cb) => {
            cb(null, {
                originalName: file.originalname,
                uploadedBy: req.user?.userId || 'anonymous',
                uploadedByName: req.user?.name || null,
                uploadTime: new Date().toISOString()
            });
        },
        key: (req, file, cb) => {
            try {
                const key = generateFileKey(req, file);
                cb(null, key);
            } catch (error) {
                cb(error);
            }
        }
    }),
    limits: {
        fileSize: FILE_SIZE_LIMITS.default,
        files: 1 // Single file per upload
    },
    fileFilter: fileFilter
});

// Configure multer for multiple files
export const uploadMultiple = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: process.env.S3_BUCKET_NAME || 'temp-bucket',
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: (req, file, cb) => {
            cb(null, {
                originalName: file.originalname,
                uploadedBy: req.user?.userId || 'anonymous',
                uploadedByName: req.user?.name || null,
                uploadTime: new Date().toISOString()
            });
        },
        key: (req, file, cb) => {
            try {
                const key = generateFileKey(req, file);
                cb(null, key);
            } catch (error) {
                cb(error);
            }
        }
    }),
    limits: {
        fileSize: FILE_SIZE_LIMITS.default,
        files: 10 // Maximum 10 files
    },
    fileFilter: fileFilter
});

// Delete file from S3
export const deleteFileFromS3 = async (key) => {
    try {
        if (!hasValidS3Config) {
            throw new Error('S3 configuration is not valid');
        }

        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key
        };

        await s3Client.send(new DeleteObjectCommand(params));
        return { success: true, message: 'File deleted successfully' };
    } catch (error) {
        console.error('Error deleting file from S3:', error);
        return { success: false, message: error.message };
    }
};

// Generate signed URL for private files
export const getSignedUrl = async (key, expiresIn = 3600) => {
    try {
        if (!hasValidS3Config) {
            throw new Error('S3 configuration is not valid');
        }

        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key
        };

        const command = new GetObjectCommand(params);
        const signedUrl = await generatePresignedUrl(s3Client, command, { expiresIn });
        return signedUrl;
    } catch (error) {
        console.error('Error generating signed URL:', error);
        throw error;
    }
};

// Extract key from S3 URL
export const extractKeyFromUrl = (url) => {
    try {
        // Handle different S3 URL formats
        const patterns = [
            /https?:\/\/[^\/]+\/(.+)/, // Standard S3 URL
            /s3:\/\/([^\/]+)\/(.+)/,   // S3 URI format
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1].startsWith(process.env.S3_BUCKET_NAME) ?
                    match[1].replace(`${process.env.S3_BUCKET_NAME}/`, '') :
                    match[1];
            }
        }

        return url; // Return as-is if no pattern matches
    } catch (error) {
        console.error('Error extracting key from URL:', error);
        return null;
    }
};

// Check if file exists in S3
export const fileExistsInS3 = async (key) => {
    try {
        if (!hasValidS3Config) {
            return false;
        }

        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key
        };

        await s3Client.send(new GetObjectCommand(params));
        return true;
    } catch (error) {
        if (error.name === 'NoSuchKey' || error.name === 'NotFound') {
            return false;
        }
        console.error('Error checking file existence:', error);
        return false;
    }
};

// Utility function for exam-related uploads
export const examUploadUtils = {
    // Upload exam paper
    uploadExamPaper: (req, res, next) => {
        const uploadMiddleware = upload.single('examPaper');
        uploadMiddleware(req, res, next);
    },

    // Upload answer sheet
    uploadAnswerSheet: (req, res, next) => {
        const uploadMiddleware = upload.single('answerSheet');
        uploadMiddleware(req, res, next);
    },

    // Upload result file
    uploadResultFile: (req, res, next) => {
        const uploadMiddleware = upload.single('resultFile');
        uploadMiddleware(req, res, next);
    },

    // Upload profile picture
    uploadProfilePicture: (req, res, next) => {
        const uploadMiddleware = upload.single('profilePicture');
        uploadMiddleware(req, res, (err) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            next();
        });
    }
};

// Fallback local storage for development (if S3 is not configured)
const memoryStorage = multer.memoryStorage();
export const localUpload = multer({
    storage: memoryStorage,
    limits: {
        fileSize: FILE_SIZE_LIMITS.default
    },
    fileFilter: fileFilter
});

export const isS3Configured = hasValidS3Config;