import multer from 'multer';

// Use memory storage to process buffers with ImageKit
const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit (for video)
    },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'introVideo') {
            if (file.mimetype.startsWith('video/')) {
                cb(null, true);
            } else {
                cb(new Error('Invalid file type: introVideo must be a video'), false);
            }
        } else if (file.fieldname === 'collegeIdCard' || file.fieldname === 'document') {
            // Both college ID card and individual documents must be images
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error(`Invalid file type: ${file.fieldname} must be an image`), false);
            }
        } else {
            cb(new Error(`Unexpected field: ${file.fieldname}`), false);
        }
    },
});
