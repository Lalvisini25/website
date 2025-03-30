import { connection } from '../config/db.js';

// Export the signup function
export const signup = (req, res) => {
  // Extract USERNAME, PASSWORD, and PERMISSIONS from the request body
  const { USERNAME, PASSWORD, PERMISSIONS } = req.body

  // Check if the username already exists in the database
  connection.query("SELECT username FROM users WHERE username = ?", [USERNAME], (err, result) => {
    // Handle database error
    if (err) return res.status(500).json({ error: "DB error" })
    // If username exists, respond with an error
    if (result.length > 0) return res.status(400).json({ error: "Username already exists" })

    // Insert the new user into the users table
    connection.query(
      "INSERT INTO users (username, password, permissions) VALUES (?, ?, ?)",
      [USERNAME, PASSWORD, PERMISSIONS],
      (err) => {
        // Handle insertion error
        if (err) return res.status(500).json({ error: "Failed to insert user" })

        // Retrieve the user_id of the newly inserted user
        connection.query("SELECT user_id FROM users WHERE username = ?", [USERNAME], (err, result) => {
          // Handle error or if user_id is not found
          if (err || result.length === 0) return res.status(500).json({ error: "Failed to get user ID" })

          // Determine which table to insert into based on PERMISSIONS
          const userId = result[0].user_id
          const table = PERMISSIONS === 'teacher' ? 'teachers' : 'students'

          // Insert the user_id into the appropriate table
          connection.query(`INSERT INTO ${table} (user_id) VALUES (?)`, [userId], () => {
            // Respond with a success message
            return res.json({ message: "User registered" })
          })
        })
      }
    )
  })
}

