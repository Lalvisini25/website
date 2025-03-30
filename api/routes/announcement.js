import express from 'express';
import { addAnnouncement } from '../classroom/announcements.js';
import { getClassAnnouncements } from '../classroom/announcements.js';

const router = express.Router()

// Add an announcement to a classroom
router.post('/add', addAnnouncement)

// Get all announcements for a classroom
router.get('/get/class', getClassAnnouncements)

export default router;