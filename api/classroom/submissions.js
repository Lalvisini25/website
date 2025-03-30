import { connection } from '../config/db.js';
import { generateFeedback } from './feedback.js';

export const getClassSubmissions = (req, res) => {
  // This function retrieves all submissions for a given class and assignment
  // It takes two parameters - CLASS_ID and ASSIGNMENT_ID
  // It checks if the required parameters are present, and if not, returns a 400 error
  // It then executes a database query to select all submissions for the specified class and assignment

  const { CLASS_ID, ASSIGNMENT_ID } = req.query

  if (!CLASS_ID || !ASSIGNMENT_ID) {
    return res.status(400).json({ error: "Missing class ID or assignment ID" })
  }

  // Construct the query based on the parameters
  const query = `
    SELECT 
      u.user_id,
      u.username AS student_name,
      s.student_id,
      sub.submission_id,
      sub.file_path,
      sub.grade,
      sub.submission_date,
      a.deadline_date
    FROM class_enrollments ce
    JOIN students s ON ce.student_id = s.student_id
    JOIN users u ON s.user_id = u.user_id
    LEFT JOIN submissions sub 
      ON sub.assignment_id = ? AND sub.student_id = s.student_id
    LEFT JOIN assignments a 
      ON a.assignment_id = ?
    WHERE ce.class_id = ?
  `

  // Execute the query
  connection.query(query, [ASSIGNMENT_ID, ASSIGNMENT_ID, CLASS_ID], (err, results) => {
    // Check for any query errors
    if (err) {
      console.error("Error fetching submissions:", err)
      return res.status(500).json({ error: "Database error" })
    }

    // If the query is successful, return the results
    res.json(results)
  })
}
// This function retrieves a single submission from the database given a submission ID
// It checks if the required parameter is present, and if not, returns a 400 error
// It then executes a database query to select the submission and related information
export const getSingleSubmission = (req, res) => {
  const { SUBMISSION_ID } = req.query;

  const query = `
    SELECT 
      s.submission_id,
      s.assignment_id,
      s.student_id,
      s.file_path,
      s.submission_date,
      s.grade,
      s.feedback,
      a.class_id,
      u.username AS student_name
    FROM submissions s
    JOIN students st ON s.student_id = st.student_id
    JOIN users u ON st.user_id = u.user_id
    JOIN assignments a ON a.assignment_id = s.assignment_id
    WHERE s.submission_id = ?
  `

  connection.query(query, [SUBMISSION_ID], (err, result) => {
    if (err) {
      console.error("Error fetching submission:", err)
      return res.status(500).json({ error: "Database error" })
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "Submission not found" })
    }

    res.json(result[0])
  })
}

export const getStudentSubmission = (req, res) => {
  // Extract assignment ID and student ID from the query parameters
  const { ASSIGNMENT_ID, STUDENT_ID } = req.query

  // Check if the required parameters are present
  if (!ASSIGNMENT_ID || !STUDENT_ID) {
    return res.status(400).json({ error: "Missing assignment ID or student ID" })
  }

  // Execute a database query to fetch the student's submission
  connection.query(
    "SELECT *, CONCAT('/uploads/', feedback_pdf_filename) AS feedback_pdf FROM submissions WHERE assignment_id = ? AND student_id = ?",
    [ASSIGNMENT_ID, STUDENT_ID],
    (err, result) => {
      // Handle any query errors
      if (err) {
        console.error("Error fetching submission:", err)
        return res.status(500).json({ error: "Database error" })
      }

      // Return the submission result if found, otherwise return null
      if (result.length === 0) return res.json(null)
      return res.json(result[0])
    }
  )
}

export const gradeSubmission = (req, res) => {
  const { submission_id, grade, feedback } = req.body

  // Check if submission ID and grade are present
  if (!submission_id || grade === undefined) {
    return res.status(400).json({ error: "Missing submission ID or grade" })
  }

  // Fetch the assignment ID of the submission
  connection.query("SELECT assignment_id FROM submissions WHERE submission_id = ?", [submission_id], (err, submissionResult) => {
    if (err || submissionResult.length === 0) {
      console.error("Error fetching submission for grading:", err)
      return res.status(400).json({ error: "Invalid submission ID" })
    }

    const assignmentId = submissionResult[0].assignment_id

    // Fetch the paper type of the assignment
    connection.query("SELECT paper_type FROM assignments WHERE assignment_id = ?", [assignmentId], (err, assignmentResult) => {
      if (err || assignmentResult.length === 0) {
        console.error("Error fetching assignment for grading:", err)
        return res.status(400).json({ error: "Assignment not found" })
      }

      const paperType = assignmentResult[0].paper_type

      // Determine the max grade allowed for the paper type
      let maxGrade = 7
      if (paperType === "paper 1") maxGrade = 20
      else if (paperType === "paper 2") maxGrade = 30

      // Check if the grade exceeds the max allowed
      if (grade > maxGrade) {
        return res.status(400).json({ error: `Grade exceeds max for ${paperType}. Max allowed is ${maxGrade}` })
      }

      // Update the grade and feedback for the submission
      const updateQuery = `UPDATE submissions SET grade = ?, feedback = ? WHERE submission_id = ?`

      connection.query(updateQuery, [grade, feedback, submission_id], (err) => {
        if (err) {
          console.error("Error updating grade/feedback:", err)
          return res.status(500).json({ error: "Failed to update submission" })
        }

        // Generate a PDF of the feedback and save it to the database
        const filename = `feedback_${submission_id}.pdf`

        generateFeedback(feedback, filename)
          .then(() => {
            connection.query(
              "UPDATE submissions SET feedback_pdf_filename = ? WHERE submission_id = ?",
              [filename, submission_id],
              (err) => {
                if (err) {
                  console.error("Error saving PDF filename:", err)
                  return res.status(500).json({ error: "PDF created but failed to update DB" })
                }

                res.json({
                  message: "Submission graded and feedback PDF saved",
                  feedback_pdf: `/uploads/${filename}`
                })
              }
            )
          })
          .catch(err => {
            console.error("Error generating PDF:", err)
            return res.status(500).json({ error: "Grade saved but PDF generation failed" })
          })
      })
    })
  })
}

