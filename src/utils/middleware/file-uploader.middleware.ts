// file-upload-middleware.ts
import multer, { MulterError } from 'multer';
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { BadRequestException } from '../error';
import { messages } from '../../lang/api-messages';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
];

// Storage configuration (disk)
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
        cb(null, uniqueName);
    },
});

// File type filter
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new BadRequestException(
                messages.invalidUploadFileType,
            ),
        );
    }
};

// Multer upload middleware
const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter,
}).single('file'); // Accept `file` field

// Middleware wrapper
export const uploadSingleFile = (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, (err: any) => {
        if (err instanceof MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return next(
                    new BadRequestException(messages.uploadFileTooLarge),
                );
            }
            if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                return next(new BadRequestException(messages.uploadUnexpectedField));
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return next(new BadRequestException(messages.uploadTooManyFiles));
            }
            return next(new BadRequestException(messages.fileUploadFailed(err.message)));
        } else if (err) {
            return next(err);
        }

        if (!req.file) {
            return next(new BadRequestException(messages.noFileUploaded));
        }

        next();
    });
};
