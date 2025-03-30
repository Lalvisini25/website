import { connection } from '../config/db.js';

// Adds a new assignment to the database, based on the values provided in the body of the request
// The required fields are class_id, deadline_date, and task_description
// It also takes an optional paper_type field which defaults to "none"
// Another optional field is downloads, which is an array of links to the assignment's resources
export const addAssignment = (req, res) => {
  // Extract the relevant fields from the request body
  const { class_id, deadline_date, task_description, paper_type = 'none', downloads = [] } = req.body

  // Check the required fields are present
  if (!class_id || !deadline_date || !task_description) {
    return res.status(400).json({ error: "Missing required fields" })
  }

  // Create the current date and time
  const creation_date = new Date().toISOString().slice(0, 10)

  // Create the SQL query to insert the assignment into the database
  connection.query(
    "INSERT INTO assignments (class_id, creation_date, deadline_date, task_description, paper_type) VALUES (?, ?, ?, ?, ?)",
    [class_id, creation_date, deadline_date, task_description, paper_type],
    (err, result) => {
      // If there is an error, log it and return a 500 error
      if (err) {
        console.error("Error adding assignment:", err)
        return res.status(500).json({ error: "Failed to add assignment" })
      }

      // Extract the id of the newly created assignment
      const assignment_id = result.insertId

      // If there are no resource links, just return a success message
      if (downloads.length === 0) {
        return res.json({ message: "Assignment added successfully", assignment_id })
      }

      // Otherwise, create the SQL query to insert the resource links into the database
      const resourceValues = downloads.map(link => [assignment_id, link])

      connection.query(
        "INSERT INTO resources (assignment_id, resource_link) VALUES ?",
        [resourceValues],
        (resourceErr) => {
          // If there is an error, log it and return a 500 error
          if (resourceErr) {
            console.error("Error adding resource links:", resourceErr)
            return res.status(500).json({ error: "Assignment added but failed to save resources" })
          }

          // If all is well, return a success message
          return res.json({
            message: "Assignment and resources added successfully",
            assignment_id
          })
        }
      )
    }
  )
}

// This function retrieves all assignments for a given class
export const getAssignmentsForClass = (req, res) => {
  // Extract the class ID from the request query parameters
  const class_id = req.query.ID

  // Execute a database query to select all assignments for the specified class
  connection.query("SELECT * FROM assignments WHERE class_id = ?", [class_id], (err, results) => {
    // Check for any query errors
    if (err) {
      // Log the error and send a 500 response with an error message
      console.error("Error fetching assignments:", err)
      return res.status(500).json({ error: "Failed to fetch assignments" })
    }

    // If no errors, send the query results as a JSON response
    res.json(results)
  })
}
// This function retrieves a single assignment from the database given a class ID and an assignment ID
// It checks if the required parameters are present, and if not, returns a 400 error
// It then executes a database query to select the assignment and its resources
export const getSingleAssignment = (req, res) => {
  const classId = req.query.CLASS_ID;
  const assignmentId = req.query.ASSIGNMENT_ID;

  if (!classId || !assignmentId) {
    return res.status(400).json({ error: "Missing class ID or assignment ID" })
  }

  // Execute a database query to select the assignment
  connection.query(
    "SELECT * FROM assignments WHERE class_id = ? AND assignment_id = ?",
    [classId, assignmentId],
    (err, result) => {
      // Check for any query errors
      if (err) {
        console.error("Error fetching assignment:", err)
        return res.status(500).json({ error: "Database error" })
      }

      // If the assignment is not found, return a 404 error
      if (result.length === 0) {
        return res.status(404).json({ error: "Assignment not found" })
      }

      // Extract the assignment from the result
      const assignment = result[0]

      // Execute a database query to select the resources for the assignment
      connection.query(
        "SELECT resource_link, original_name FROM resources WHERE assignment_id = ?",
        [assignment.assignment_id],
        (err, resourceResult) => {
          // Check for any query errors
          if (err) {
            console.error("Error fetching resources:", err)
            return res.status(500).json({ error: "Failed to load resources" })
          }

          // Add the resources to the assignment and return the complete assignment
          assignment.resources = resourceResult
          return res.json(assignment)
        }
      )
    }
  )
}
// This function is used to submit a new assignment for a student
// It takes three parameters - assignment_id, student_id, and a file to be uploaded
// It checks if the required parameters are present, and if not, returns a 400 error
// It then executes a database query to insert the submission into the database
export const submitAssignment = (req, res) => {
  const { assignment_id, student_id } = req.body

  // Check if the required parameters are present
  if (!assignment_id || !student_id || !req.file) {
    return res.status(400).json({ error: "Missing required fields or file" })
  }

  // Construct the filepath for the uploaded file
  const filePath = `/uploads/${req.file.filename}`

  // Execute a database query to insert the submission into the database
  connection.query(
    "INSERT INTO submissions (assignment_id, student_id, file_path) VALUES (?, ?, ?)",
    [assignment_id, student_id, filePath]
  , (err, result) => {
    // Check for any query errors
    if (err) {
      console.error("Error submitting assignment:", err)
      return res.status(500).json({ error: "Database error" })
    }

    // If the query is successful, return a success message with the submission ID and file path
    return res.json({
      message: "Submission successful",
      submission_id: result.insertId,
      file_path: filePath
    })
  })
}