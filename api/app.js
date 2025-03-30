import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import classroomRoutes from './routes/classroom.js';
import uploaderRoutes from './routes/uploader.js';
import announcementRoutes from './routes/announcement.js';

// Setup express with cors and body-parser middlewares
const api = express()
api.use(cors())
api.use(bodyParser.json())
// Serve the uploads folder as the path for uploading content
api.use('/', express.static(path.resolve('uploads')))

// Define the routes
api.use('/', authRoutes)
api.use('/', classroomRoutes)
api.use('/', uploaderRoutes)
api.use('/', announcementRoutes)

// Export the express app
export { api };

