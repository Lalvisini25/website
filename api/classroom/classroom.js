import { connection } from '../config/db.js';
import { LinkedList } from '../../src/utils/Data Structures/LinkedList.js';

export const addClassroom = (req, res) => {
  // Extract required data from the request body
  const { PERMISSIONS, ID, NAME, COLOUR, STUDENTS } = req.body

  // Validate required fields and permissions
  if (!PERMISSIONS || !ID || !NAME || !COLOUR || !Array.isArray(STUDENTS)) {
    return res.status(400).json({ error: "Missing required fields" })
  }

  if (PERMISSIONS !== 'teacher' && PERMISSIONS !== 'admin') {
    return res.status(403).json({ error: "Unauthorized" })
  }

  // Check if the user is a teacher
  connection.query("SELECT teacher_id FROM teachers WHERE user_id = ?", [ID], (err, teacherResult) => {
    if (err || teacherResult.length === 0) {
      return res.status(400).json({ error: "User is not a teacher" })
    }

    const teacherId = teacherResult[0].teacher_id

    // Check for duplicate class names
    connection.query("SELECT class_name FROM classes WHERE class_name = ?", [NAME], (err, existing) => {
      if (err) return res.status(500).json({ error: "Error checking for duplicates" })
      if (existing.length > 0) return res.status(400).json({ error: "Class already exists" })

      // Insert new class
      connection.query("INSERT INTO classes (teacher_id, class_name, colour) VALUES (?, ?, ?)",
        [teacherId, NAME, COLOUR],
        (err, insertResult) => {
          if (err) return res.status(500).json({ error: "Error creating class" })

          const classId = insertResult.insertId
          connection.query("INSERT INTO class_teachers (class_id, teacher_id) VALUES (?, ?)", [classId, teacherId])

          let remaining = STUDENTS.length
          let failedUsers = []

          // If no students, return success response
          if (remaining === 0) {
            return res.json({ message: "Class created", class_id: classId })
          }

          // Enroll each student
          STUDENTS.forEach(student => {
            const { username } = student

            connection.query("SELECT user_id FROM users WHERE username = ?", [username], (err, result) => {
              if (err || result.length === 0) {
                failedUsers.push(username)
                if (--remaining === 0) finish()
                return
              }

              const userId = result[0].user_id
              connection.query("SELECT student_id FROM students WHERE user_id = ?", [userId], (err, result) => {
                if (err || result.length === 0) {
                  failedUsers.push(username)
                  if (--remaining === 0) finish()
                  return
                }

                const studentId = result[0].student_id
                connection.query("INSERT INTO class_enrollments (class_id, student_id) VALUES (?, ?)", [classId, studentId], (err) => {
                  if (err) failedUsers.push(username)
                  if (--remaining === 0) finish()
                })
              })
            })
          })

          // Send response after processing all students
          function finish() {
            res.json({
              message: failedUsers.length > 0
                ? "Class created (some students not enrolled)"
                : "Class created successfully",
              class_id: classId,
              failedUsers
            })
          }
        }
      )
    })
  })
}

export const getClassrooms = async (req, res) => {
  // Extract query parameters
  const { ID, PERMISSION, TEACHER_ID } = req.query

  // Function to get student ID based on user ID
  const getStudentId = () => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT student_id FROM students WHERE user_id = ?", [ID], (err, result) => {
        if (err || result.length === 0) reject("Student not found")
        else resolve(result[0].student_id)
      })
    })
  }

  // Function to get enrollments based on permission
  const getEnrollments = (id) => {
    const query = PERMISSION !== "teacher"
      ? "SELECT * FROM class_enrollments WHERE student_id = ?"
      : "SELECT * FROM class_teachers WHERE teacher_id = ?"
    return new Promise((resolve, reject) => {
      connection.query(query, [id], (err, result) => {
        if (err) reject(err)
        else resolve(result)
      })
    })
  }

  // Function to get class information
  const getClassInfo = (class_id) => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT * FROM classes WHERE class_id = ?", [class_id], (err, result) => {
        if (err || result.length === 0) reject("Class not found")
        else resolve(result[0])
      })
    })
  }

  try {
    let enrollments = []

    // Get enrollments based on permission
    if (PERMISSION === "student") {
      const studentId = await getStudentId()
      enrollments = await getEnrollments(studentId)
    } else {
      enrollments = await getEnrollments(TEACHER_ID)
    }

    const classes = new LinkedList()
    for (const enrollment of enrollments) {
      const classDetails = await getClassInfo(enrollment.class_id)
      classes.insertAtTail(classDetails)
    }

    res.json(classes.array())
  } catch (error) {
    console.error("Error:", error)
    res.status(500).json({ error: "Failed to get classes" })
  }
}

export const getClassInfo = (req, res) => {
  // Get class ID from query
  const classId = req.query.ID

  // Fetch class details
  connection.query("SELECT * FROM classes WHERE class_id = ?", [classId], (err, result) => {
    if (err || result.length === 0) {
      return res.status(404).json({ error: "Class not found" })
    }

    const classroom = result[0]

    // Fetch teacher information
    connection.query(
      "SELECT u.username FROM users u JOIN teachers t ON u.user_id = t.user_id WHERE t.teacher_id = ?",
      [classroom.teacher_id],
      (err, teacherResult) => {
        if (err || teacherResult.length === 0) {
          return res.status(500).json({ error: "Failed to get teacher info" })
        }

        classroom.teacher = teacherResult[0].username
        res.json(classroom)
      }
    )
  })
}

export const getAllStudents = (req, res) => {
  // Fetch all students
  connection.query("SELECT * FROM students", async (err, studentsResult) => {
    if (err) return res.status(500).json({ error: "DB error" })

    const students = new LinkedList()

    // Function to get user information by ID
    const getUserById = (id) => {
      return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM users WHERE user_id = ?", [id], (err, result) => {
          if (err) reject(err)
          else resolve(result[0])
        })
      })
    }

    try {
      for (const student of studentsResult) {
        const user = await getUserById(student.user_id)
        students.insertAtTail(user)
      }

      res.json(students.array())
    } catch (error) {
      res.status(500).json({ error: "Failed to load users" })
    }
  })
}

export const getStudentByUserId = (req, res) => {
  // Get user ID from query
  const userId = req.query.USER_ID
  if (!userId) return res.status(400).json({ error: "Missing user ID" })

  // Fetch student ID
  connection.query(
    "SELECT student_id FROM students WHERE user_id = ?",
    [userId],
    (err, result) => {
      if (err) {
        console.error("Error fetching student_id:", err)
        return res.status(500).json({ error: "Database error" })
      }
      if (result.length === 0) return res.status(404).json({ error: "Student not found" })

      return res.json({ student_id: result[0].student_id })
    }
  )
}

export const uploadResource = (req, res) => {
  // Get assignment ID and validate file
  const { assignment_id } = req.body

  if (!req.file || !assignment_id) {
    return res.status(400).json({ error: "Missing file or assignment_id" })
  }

  const resource_link = `/uploads/${req.file.filename}`
  const original_name = req.file.originalname

  // Insert resource record
  connection.query(
    "INSERT INTO resources (assignment_id, resource_link, original_name) VALUES (?, ?, ?)",
    [assignment_id, resource_link, original_name],
    (err) => {
      if (err) {
        console.error("Error inserting resource:", err)
        return res.status(500).json({ error: "Database error" })
      }

      res.json({
        message: "Resource uploaded",
        link: resource_link,
        name: original_name,
      })
    }
  )
}

export const getTeacher = (req, res) => {
  // Get teacher ID from query
  const teacher_id = req.query.ID

  // Fetch user ID for teacher
  connection.query("SELECT user_id FROM teachers WHERE teacher_id = ?", [teacher_id], (err, result) => {
    if (err) {
      console.error("Error fetching teacher user_id:", err)
      return res.status(500).json({ error: "Error accessing database" })
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "Teacher not found" })
    }

    const user_id = result[0].user_id

    // Fetch user details
    connection.query("SELECT * FROM users WHERE user_id = ?", [user_id], (err, userResult) => {
      if (err) {
        console.error("Error fetching user:", err)
        return res.status(500).json({ error: "Error accessing user data" })
      }

      if (userResult.length === 0) {
        return res.status(404).json({ error: "User not found" })
      }

      return res.json({ teacher: userResult[0] })
    })
  })
}

export const getTeacherIdFromUser = (req, res) => {
  const user_id = req.query.ID;
  connection.query("SELECT teacher_id FROM teachers WHERE user_id = ?", [user_id], (err, result) => {
    if (err) {
      console.log("Error fetching teacher user_id:", err);
      return res.status(500).json({ error: "Error accessing database" });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const teacher_id = result[0];

    return res.json({ teacher_id: teacher_id });
  })
}


