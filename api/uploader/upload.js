import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { connection } from '../config/db.js';

const router = express.Router();

// Create the uploads directory if it doesn't exist
const uploadDir = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir)
}

// Multer storage configuration
const storage = multer.diskStorage({
  // Set the destination of the uploaded file
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },

  // Set the filename of the uploaded file
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, `${uniqueSuffix}-${file.originalname}`)
  }
})
// Set up Multer to handle file uploads to the uploads directory
const upload = multer({ storage });

// Handle POST requests to upload a file
router.post('/upload', upload.single('file'), (req, res) => {
  const { assignment_id } = req.body;

  // Check if we have the required parameters
  if (!req.file || !assignment_id) {
    return res.status(400).json({ error: 'Missing file or assignment_id' })
  }

  // Set up the filename and URL for the uploaded file
  const resource_link = `/uploads/${req.file.filename}`
  const original_name = req.file.originalname

  // Insert the resource into the database
  connection.query(
    'INSERT INTO resources (assignment_id, resource_link, original_name) VALUES (?, ?, ?)',
    [assignment_id, resource_link, original_name]
  , (err) => {
    // If there is a database error, return a 500 status code
    if (err) {
      console.error('Error inserting resource:', err)
      return res.status(500).json({ error: 'Database error' })
    }

    // If the resource was successfully inserted, return the URL of the uploaded file
    return res.json({
      message: 'Resource uploaded',
      link: resource_link,
      name: original_name
    })
  })
})

export default router;