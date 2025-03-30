import express from 'express';
import { login } from '../auth/login.js';
import { signup } from '../auth/signup.js';

const router = express.Router()

// Authenticates a user based on provided credentials
router.post('/login', login)

// Creates a new user
router.post('/signup', signup)

export default router;
