// Import the database connection
import { connection } from '../config/db.js';
// Import the jsonwebtoken library for creating JWT tokens
import jwt from 'jsonwebtoken';

// Export the login function
export const login = (req, res) => {
  // Extract USERNAME and PASSWORD from the request body
  const { USERNAME, PASSWORD } = req.body;

  // Query the database to find a user with the provided username
  connection.query("SELECT * FROM users WHERE username = ?", [USERNAME], (err, results) => {
    // If there is a database error, respond with a 500 status code
    if (err) return res.status(500).json({ error: "Database error" })
    // If no user is found or the password does not match, respond with a 401 status code
    if (results.length === 0 || results[0].password !== PASSWORD) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // If credentials are valid, get the user data from the query result
    const user = results[0];
    // Generate a JWT token using the username and a secret key
    const token = jwt.sign({ username: USERNAME }, process.env.JWT_KEY);
    // Respond with a JSON object containing a success message, user info, and the JWT token
    res.json({
      message: "Login successful",
      user: {
        id: user.user_id,
        username: user.username,
        password: user.password,
        permission: user.permissions,
      },
      loginToken: token
    })
  })
}