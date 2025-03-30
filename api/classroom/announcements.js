import { connection } from '../config/db.js';

// This function is used to add an announcement to the database
// It takes in the class_id, title and message from the request body
// and inserts them into the announcements table in the database
// The function returns a json object with a message and the id
// of the newly inserted announcement
export const addAnnouncement = (req, res) => {
  // Get the class_id, title and message from the request body
  const { class_id, title, message } = req.body

  // Insert the announcement into the database
  connection.query(
    "INSERT INTO announcements (class_id, title, message) VALUES (?, ?, ?)",
    [class_id, title, message]
  )
  // If there is an error, return a 500 status with a json object describing the error
  .on('error', err => {
    return res.status(500).json({ error: "Database error" })
  })
  // If the query is successful, return a 200 status with a json object
  // describing the newly inserted announcement
  .on('result', result => {
    return res.json({ message: "Announcement added", announcement_id: result.insertId })
  })
}

// This function is used to get all announcements for a given class from the database
// It takes in a class_id from the request query and uses it to query the database
// The function returns a json object containing the result of the query
export const getClassAnnouncements = (req, res) => {
  // Get the class_id from the request query
  const { ID } = req.query;

  // Query the database for all announcements for the given class
connection.query(
     "SELECT * FROM announcements WHERE class_id = ? ORDER BY date_created DESC",
     [ID],
     (err, result) => {
       if (err) {
         console.error("Error fetching announcements:", err);
         return res.status(500).json({ error: "Database error" })
       }
 
       return res.json(result);
  });
}
