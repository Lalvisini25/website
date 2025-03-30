import express from 'express';
import uploadRoutes from '../uploader/upload.js';

// This router is used to handle requests to upload resources such as pdfs, images, and videos
const router = express.Router()

// The resources are stored in the uploads directory
router.use('/resources', uploadRoutes)

export default router;
