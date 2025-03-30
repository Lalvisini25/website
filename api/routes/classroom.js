import express from 'express';
import { addClassroom } from '../classroom/classroom.js';
import { getClassrooms } from '../classroom/classroom.js';
import { getClassInfo } from '../classroom/classroom.js';
import { getAllStudents } from '../classroom/classroom.js';
import { getStudentByUserId } from '../classroom/classroom.js';
import { getTeacher } from '../classroom/classroom.js';
import { getTeacherIdFromUser } from '../classroom/classroom.js';
import { addAnnouncement } from '../classroom/announcements.js';
import { getClassAnnouncements } from '../classroom/announcements.js';
import { addAssignment } from '../classroom/assignments.js';
import { getAssignmentsForClass } from '../classroom/assignments.js';
import { getSingleAssignment } from '../classroom/assignments.js';
import { submitAssignment } from '../classroom/assignments.js';
import { getClassSubmissions } from '../classroom/submissions.js';
import { getSingleSubmission } from '../classroom/submissions.js';
import { gradeSubmission } from '../classroom/submissions.js';
import { getStudentSubmission } from '../classroom/submissions.js';
import { uploadResource } from '../classroom/classroom.js';
import multer from 'multer';
import { generateFeedback } from '../classroom/feedback.js';

const router = express.Router();

// Configure multer to store uploaded files in 'uploads/' directory
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, unique + '-' + file.originalname)
  }
})
const upload = multer({ storage })

// Create a new classroom
router.post('/classrooms/add', addClassroom)

// Get all classrooms
router.get('/classrooms/get', getClassrooms)

// Get classroom information
router.get('/classrooms/get/classInfo', getClassInfo)

// Get all students
router.get('/students/get', getAllStudents)

// Get student by user ID
router.get('/students/get/byUserId', getStudentByUserId)

// Get teacher
router.get('/teacher/get', getTeacher)

// Get teacher ID from user ID
router.get('/teacher/get/user', getTeacherIdFromUser)

// Add an announcement to a classroom
router.post('/announcements/add', addAnnouncement)

// Get all announcements for a classroom
router.get('/announcements/get/class', getClassAnnouncements)

// Add an assignment to a classroom
router.post('/assignments/add', addAssignment)

// Get all assignments for a classroom
router.get('/assignments/get/class', getAssignmentsForClass)

// Get a single assignment
router.get('/assignments/get', getSingleAssignment)

// Submit an assignment
router.post('/assignments/submit', submitAssignment)

// Get all submissions for a classroom
router.get('/submissions/get/class', getClassSubmissions)

// Get a single submission
router.get('/submissions/get/single', getSingleSubmission)

// Grade a submission
router.post('/submissions/grade', gradeSubmission)

// Get all submissions for a student
router.get('/submissions/get/student', getStudentSubmission)

// Upload a resource
router.post('/resources/upload', upload.single("file"), uploadResource)

// Generate feedback
router.post('/feedback/generate', generateFeedback)

export default router;
