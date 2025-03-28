import mysql from "mysql";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from "pdfkit";
import { Configuration, OpenAIApi } from "openai";
dotenv.config();

import { LinkedList } from "../src/utils/Data Structures/LinkedList.js";

//https://www.youtube.com/watch?v=g1lzdoitZkg last 40minutes for authentication

const api = express();
api.use(bodyParser.json());
api.use(cors());
api.use('/uploads', express.static(path.resolve('uploads')));

api.listen(3000, () => {
  console.log("Server is up and running [Port: 3000]");
})

const dbSettings = {
  host: 'localhost',
  user: 'testUser',
  password: 'Password',
  database: 'book_4_thought_db',
}

const connection = mysql.createConnection(dbSettings);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const generateFeedbackPDF = (text, filename) => {
  return new Promise((resolve, reject) => {
    const fontPath = path.join(__dirname, '..', 'fonts', 'CAVOLINI.TTF'); // adjust path if needed
    const pdfPath = path.join('uploads', filename);

    const doc = new PDFDocument();
    const stream = fs.createWriteStream(pdfPath);

    doc.pipe(stream);
    doc.registerFont('Cavolini', fontPath);
    doc.font('Cavolini').fillColor('red').fontSize(14).text(text, {
      width: 450,
      align: 'left',
    });

    doc.end();

    stream.on('finish', () => resolve('/' + pdfPath));
    stream.on('error', reject);
  });
};


api.post("/login", (req, res) => {
    const details = { 
        username: req.body.USERNAME,
        password: req.body.PASSWORD
    }

    connection.query("SELECT * FROM users WHERE username = ?", [details.username], (err, results) => {
        if (err) {
            console.log(err)
            return res.status(500).json({ error: "Error accessing database" })
        }

        if (results.length === 0) {
            return res.status(401).json({ error: "Invalid username or password" }); // returns HTTP 401 error
        }

        const loginUser = results[0];
    
        if (details.password === loginUser.password) {
            const token = jwt.sign(details, process.env.JWT_KEY)
            console.log("Successful login:", loginUser.username, "[id: "+ loginUser.user_id +"]")
            res.json({
                message: "Login successful", 
                user: {
                    id: loginUser.user_id,
                    username: loginUser.username,
                    password: loginUser.password,
                    permission: loginUser.permissions
                },
                loginToken: token
            });
        } else {
            res.status(401).json({ error: "Invalid username or password" }); // returns HTTP 401 error
        }
        
    })
})

api.post("/signup", (req, res) => {
    const details = {
        username: req.body.USERNAME,
        password: req.body.PASSWORD,
        permission: req.body.PERMISSIONS
    }

    connection.query("SELECT username FROM users WHERE username = ?", [details.username], (err, result) => {
        if (err) {
            console.log(err)
            return res.status(500).json({ error: "Error accessing database" })
        }

        if (result.length > 0) {
            return res.status(400).json({ error: "Username already exists" })
        }

        if (result.length == 0) {
            connection.query("INSERT INTO users (username, password, permissions) VALUES (?, ?, ?)", [details.username, details.password, details.permission])
            console.log("Successfully inserted " + details.username + " into the database")
            
        connection.query("SELECT user_id FROM users WHERE username = ?", [details.username], (err, userResult) => {
            if (err) {
                console.error("Error retrieving user ID:", err);
                return res.status(500).json({ error: "Error retrieving user ID" });
            } else if (userResult.length === 0) {
                return res.status(500).json({ error: "User ID not found after insertion" });
            }

            const userId = userResult[0].user_id;

            if (details.permission === "teacher") {
                connection.query("INSERT INTO teachers (user_id) VALUES (?)", [userId])
            } else if (details.permission === "student") { 
                connection.query("INSERT INTO students (user_id) VALUES (?)", [userId])               
            }
        })            
            return res.json({ message: "Successfully inserted user: " + details.username + " into the database" })
        }

    })

})

api.post("/classrooms/add", async (req, res) => {
  try {
    const credentials = {
      permission: req.body.PERMISSIONS,
      user: req.body.ID,
    };

    const classDetails = {
      class_name: req.body.NAME,
      colour: req.body.COLOUR,
      students: req.body.STUDENTS,
    };

    console.log("Incoming classroom data:", { credentials, classDetails });

    if (
      !credentials.permission ||
      !credentials.user ||
      !classDetails.class_name ||
      !classDetails.colour ||
      !Array.isArray(classDetails.students)
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (credentials.permission !== "teacher" && credentials.permission !== "admin") {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    connection.query("SELECT teacher_id FROM teachers WHERE user_id = ?", [credentials.user], (err, teacherResult) => {
      if (err || teacherResult.length === 0) {
        console.error("Could not find teacher_id for user:", credentials.user);
        return res.status(400).json({ error: "User is not registered as a teacher" });
      }

      const teacherId = teacherResult[0].teacher_id;

      connection.query("SELECT class_name FROM classes WHERE class_name = ?", [classDetails.class_name], (err, result) => {
        if (err) {
          console.error("Error checking class existence:", err);
          return res.status(500).json({ error: "Database error while checking class name" });
        }

        if (result.length > 0) {
          return res.status(400).json({ error: "Classroom already exists" });
        }

        connection.query("INSERT INTO classes (teacher_id, class_name, colour) VALUES (?, ?, ?)", [teacherId, classDetails.class_name, classDetails.colour], (err, insertResult) => {
          if (err) {
            console.error("Error inserting class:", err);
            return res.status(500).json({ error: "Failed to insert classroom" });
          }

          const classId = insertResult.insertId;
          console.log("New class ID:", classId);

          // ✅ Enroll teacher in class_teachers table
          connection.query("INSERT INTO class_teachers (class_id, teacher_id) VALUES (?, ?)", [classId, teacherId], (err) => {
            if (err) {
              console.error("Failed to assign teacher to class:", err);
              // not fatal
            }
          });

          const students = classDetails.students;
          let remaining = students.length;
          let failedUsers = [];
          let responseSent = false;

          if (remaining === 0) {
            return res.json({ message: "Class created with no students", class_id: classId });
          }

          students.forEach((student) => {
            const username = student.username;
            if (!username) {
              failedUsers.push("undefined username");
              if (--remaining === 0 && !responseSent) {
                responseSent = true;
                return res.json({ message: "Class created (some users missing)", class_id: classId, failedUsers });
              }
              return;
            }

            connection.query("SELECT user_id FROM users WHERE username = ?", [username], (err, userResult) => {
              if (err || userResult.length === 0) {
                console.error("Error finding user:", username, err);
                failedUsers.push(username);
                if (--remaining === 0 && !responseSent) {
                  responseSent = true;
                  return res.json({ message: "Class created (some users missing)", class_id: classId, failedUsers });
                }
                return;
              }

              const userId = userResult[0].user_id;

              connection.query("SELECT student_id FROM students WHERE user_id = ?", [userId], (err, studentResult) => {
                if (err || studentResult.length === 0) {
                  console.error("Error finding student record for user:", userId, err);
                  failedUsers.push(username);
                  if (--remaining === 0 && !responseSent) {
                    responseSent = true;
                    return res.json({ message: "Class created (some students missing)", class_id: classId, failedUsers });
                  }
                  return;
                }

                const studentId = studentResult[0].student_id;

                connection.query("INSERT INTO class_enrollments (class_id, student_id) VALUES (?, ?)", [classId, studentId], (err) => {
                  if (err) {
                    console.error("Failed to enroll student:", studentId, err);
                    failedUsers.push(username);
                  }

                  if (--remaining === 0 && !responseSent) {
                    responseSent = true;
                    return res.json({
                      message: failedUsers.length > 0 ? "Class created (some students failed to enroll)" : "Successfully inserted classroom",
                      class_id: classId,
                      failedUsers
                    });
                  }
                });
              });
            });
          });
        });
      });
    });
  } catch (error) {
    console.error("Unexpected error in /classrooms/add:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

api.get("/classrooms/get", async (req, res) => {
  const user_id = req.query.ID;
  const permission = req.query.PERMISSION;
  const teacher_id = req.query.TEACHER_ID; // <== move this up

  const getStudent = (id) => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT student_id FROM students WHERE user_id = ?", [id], (err, result) => {
        if (err) reject(err);
        else resolve(result[0]);
      });
    });
  };

  const getEnrollments = (id) => {
    return new Promise((resolve, reject) => {
      if (permission !== "teacher") {
        connection.query("SELECT * FROM class_enrollments WHERE student_id = ?", [id], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      } else {
        connection.query("SELECT * FROM class_teachers WHERE teacher_id = ?", [id], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      }
    });
  };

  const getClass = (id) => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT * FROM classes WHERE class_id = ?", [id], (err, result) => {
        if (err) reject(err);
        else resolve(result[0]);
      });
    });
  };

  try {
    let enrollments = [];

    if (permission === "student") {
      const student = await getStudent(user_id);
      enrollments = await getEnrollments(student.student_id);
    } else {
      enrollments = await getEnrollments(teacher_id);
    }

    const classes = new LinkedList();
    for (let i = 0; i < enrollments.length; i++) {
      const classroom = await getClass(enrollments[i].class_id);
      classes.insertAtTail(classroom);
    }

    return res.json(classes.array());
  } catch (err) {
    console.error("Error in /classrooms/get:", err);
    return res.status(500).json({ error: "Error processing user data" });
  }
});

api.get("/classrooms/get/classInfo", async (req, res) => {
  const classId = req.query.ID;

  const getClassData = (id) => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT * FROM classes WHERE class_id = ?", [id], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result[0]);
        }
      });
    });
  };

  try {
    const classroom = await getClassData(classId);

    if (!classroom) {
      return res.status(404).json({ error: "Class not found" });
    }

    // Optional: fetch teacher username
    const getTeacher = (teacher_id) => {
      return new Promise((resolve, reject) => {
        connection.query(
          "SELECT u.username FROM users u JOIN teachers t ON u.user_id = t.user_id WHERE t.teacher_id = ?",
          [teacher_id],
          (err, result) => {
            if (err) reject(err);
            else resolve(result[0]);
          }
        );
      });
    };

    const teacher = await getTeacher(classroom.teacher_id);
    classroom.teacher = teacher;

    return res.json(classroom);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});


api.get("/students/get", (req, res) => {
  const students = new LinkedList();
  connection.query("SELECT * FROM students", async (err, result) => {
      if (err) {
          console.log(err)
          return res.status(500).json({ error: "Error accessing database" })
      } else {
          const getUser = (id) => {
              return new Promise((resolve, reject) => {
                  const user = connection.query("SELECT * FROM users WHERE user_id = ?", [id], (err, result) => {
                      if (err) {
                          reject(err);
                      } else {
                          resolve(result[0]);
                      }
                  })
              })
          }

          try {
              for (let i = 0; i < result.length; i++) {
                  const user = await getUser(result[i].user_id);
                  students.insertAtTail(user);
              }
              return res.json(students.array())
          } catch (error) {
              return res.status(500).json({ error: "Error processing user data" });
          }
      }
  })
})

api.get("/teacher/get", (req, res) => {
  const teacher_id = req.query.ID;
  connection.query("SELECT user_id FROM teachers WHERE teacher_id = ?", [teacher_id], (err, result) => {
    if (err) {
      console.log("Error fetching teacher user_id:", err);
      return res.status(500).json({ error: "Error accessing database" });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const user_id = result[0].user_id;

    // Now fetch the user
    connection.query("SELECT * FROM users WHERE user_id = ?", [user_id], (err, userResult) => {
      if (err) {
        console.log("Error fetching user:", err);
        return res.status(500).json({ error: "Error accessing user data" });
      }

      if (userResult.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.json({ teacher: userResult[0] });
    })
  })
})

api.get("/teacher/get/user", (req, res) => {
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
})

api.post("/assignments/add", (req, res) => {
  const { class_id, deadline_date, task_description, paper_type = 'none', downloads = [] } = req.body;

  if (!class_id || !deadline_date || !task_description) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const creation_date = new Date().toISOString().slice(0, 10);

  connection.query(
    "INSERT INTO assignments (class_id, creation_date, deadline_date, task_description, paper_type) VALUES (?, ?, ?, ?, ?)",
    [class_id, creation_date, deadline_date, task_description, paper_type],
    (err, result) => {
      if (err) {
        console.error("Error adding assignment:", err);
        return res.status(500).json({ error: "Failed to add assignment" });
      }

      const assignment_id = result.insertId;

      if (downloads.length === 0) {
        return res.json({
          message: "Assignment added successfully",
          assignment_id
        });
      }

      const resourceValues = downloads.map(link => [assignment_id, link]);

      connection.query(
        "INSERT INTO resources (assignment_id, resource_link) VALUES ?",
        [resourceValues],
        (resourceErr) => {
          if (resourceErr) {
            console.error("Error adding resource links:", resourceErr);
            return res.status(500).json({ error: "Assignment added but failed to save resources" });
          }

          return res.json({
            message: "Assignment and resources added successfully",
            assignment_id
          })
        }
      )
    }
  )
})

api.get("/assignments/get/class", (req, res) => {
  const class_id = req.query.ID;

  connection.query("SELECT * FROM assignments WHERE class_id = ?", [class_id], (err, results) => {
    if (err) {
      console.error("Error fetching assignments:", err);
      return res.status(500).json({ error: "Failed to fetch assignments" });
    }

    res.json(results);
  });
});

api.get("/assignments/get", (req, res) => {
  const classId = req.query.CLASS_ID;
  const assignmentId = req.query.ASSIGNMENT_ID;

  if (!classId || !assignmentId) {
    return res.status(400).json({ error: "Missing class ID or assignment ID" });
  }

  // First get the assignment details
  connection.query(
    "SELECT * FROM assignments WHERE class_id = ? AND assignment_id = ?",
    [classId, assignmentId],
    (err, result) => {
      if (err) {
        console.error("Error fetching assignment:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: "Assignment not found" });
      }

      const assignment = result[0];

      // Now get the attached resource links
      connection.query(
        "SELECT resource_link, original_name FROM resources WHERE assignment_id = ?",
        [assignment.assignment_id],
        (err, resourceResult) => {
          if (err) {
            console.error("Error fetching resources:", err);
            return res.status(500).json({ error: "Failed to load resources" });
          }
      
          assignment.resources = resourceResult;
          return res.json(assignment);
        }
      );
    }
  );
});

api.post("/assignments/submit", upload.single('file'), (req, res) => {
  const { assignment_id, student_id } = req.body;

  if (!assignment_id || !student_id || !req.file) {
    return res.status(400).json({ error: "Missing required fields or file" });
  }

  const filePath = `/uploads/${req.file.filename}`;

  connection.query(
    "INSERT INTO submissions (assignment_id, student_id, file_path) VALUES (?, ?, ?)",
    [assignment_id, student_id, filePath],
    (err, result) => {
      if (err) {
        console.error("Error submitting assignment:", err);
        return res.status(500).json({ error: "Database error" });
      }

      return res.json({
        message: "Submission successful",
        submission_id: result.insertId,
        file_path: filePath
      });
    }
  );
});

api.post("/announcements/add", (req, res) => {
  const { class_id, title, message } = req.body;

  if (!class_id || !title || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const query = `
    INSERT INTO announcements (class_id, title, message)
    VALUES (?, ?, ?)
  `;

  connection.query(query, [class_id, title, message], (err, result) => {
    if (err) {
      console.error("Error inserting announcement:", err);
      return res.status(500).json({ error: "Database error" })
    }

    return res.json({
      message: "Announcement added successfully",
      announcement_id: result.insertId,
    })
  })
})

api.get("/announcements/get/class", (req, res) => {
  const classId = req.query.ID;

  if (!classId) {
    return res.status(400).json({ error: "Missing class ID" })
  }

  connection.query(
    "SELECT * FROM announcements WHERE class_id = ? ORDER BY date_created DESC",
    [classId],
    (err, result) => {
      if (err) {
        console.error("Error fetching announcements:", err);
        return res.status(500).json({ error: "Database error" })
      }

      return res.json(result);
    }
  )
})

api.get("/submissions/get/class", (req, res) => {
  const classId = req.query.CLASS_ID;
  const assignmentId = req.query.ASSIGNMENT_ID;

  if (!classId || !assignmentId) {
    return res.status(400).json({ error: "Missing class ID or assignment ID" });
  }

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
  `;

  connection.query(query, [assignmentId, assignmentId, classId], (err, results) => {
    if (err) {
      console.error("Error fetching submissions:", err);
      return res.status(500).json({ error: "Database error" });
    }

    return res.json(results);
  });
});

api.get("/submissions/get/single", (req, res) => {
  const submissionId = req.query.SUBMISSION_ID;

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
  `;

  connection.query(query, [submissionId], (err, result) => {
    if (err) {
      console.error("Error fetching submission:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "Submission not found" });
    }

    return res.json(result[0]);
  });
});

api.post("/submissions/grade", (req, res) => {
  const { submission_id, grade, feedback } = req.body;

  if (!submission_id || grade === undefined) {
    return res.status(400).json({ error: "Missing submission ID or grade" });
  }

  // First get the assignment_id
  connection.query("SELECT assignment_id FROM submissions WHERE submission_id = ?", [submission_id], (err, submissionResult) => {
    if (err || submissionResult.length === 0) {
      console.error("Error fetching submission for grading:", err);
      return res.status(400).json({ error: "Invalid submission ID" });
    }

    const assignmentId = submissionResult[0].assignment_id;

    // Get the paper type of the assignment
    connection.query("SELECT paper_type FROM assignments WHERE assignment_id = ?", [assignmentId], (err, assignmentResult) => {
      if (err || assignmentResult.length === 0) {
        console.error("Error fetching assignment for grading:", err);
        return res.status(400).json({ error: "Assignment not found" });
      }

      const paperType = assignmentResult[0].paper_type;

      // Determine max grade
      let maxGrade = 100; // fallback
      if (paperType === "paper 1") maxGrade = 20;
      else if (paperType === "paper 2") maxGrade = 30;
      else maxGrade = 7;

      if (grade > maxGrade) {
        return res.status(400).json({ error: `Grade exceeds max for ${paperType}. Max allowed is ${maxGrade}` });
      }

      // Update grade and feedback
      const updateQuery = `
        UPDATE submissions 
        SET grade = ?, feedback = ? 
        WHERE submission_id = ?
      `;

      connection.query(updateQuery, [grade, feedback, submission_id], (err) => {
        if (err) {
          console.error("Error updating grade/feedback:", err);
          return res.status(500).json({ error: "Database error while updating submission" });
        }

        // 🔽 Generate the PDF and store it
        const filename = `feedback_${submission_id}.pdf`;
        const filePath = path.join("uploads", filename);

        generateFeedbackPDF(feedback, filename)
          .then(() => {
            // 🔽 Save PDF filename to DB
            const pdfQuery = `
              UPDATE submissions
              SET feedback_pdf_filename = ?
              WHERE submission_id = ?
            `;

            connection.query(pdfQuery, [filename, submission_id], (err) => {
              if (err) {
                console.error("Error saving feedback PDF filename:", err);
                return res.status(500).json({ error: "PDF created but failed to update DB" });
              }

              return res.json({
                message: "Submission graded and feedback PDF saved",
                feedback_pdf: `/uploads/${filename}`
              });
            });
          })
          .catch(pdfError => {
            console.error("Error generating PDF:", pdfError);
            return res.status(500).json({ error: "Grade saved but failed to generate feedback PDF" });
          });
      });
    });
  });
});

api.get("/submissions/get/student", (req, res) => {
  const { ASSIGNMENT_ID, STUDENT_ID } = req.query;

  if (!ASSIGNMENT_ID || !STUDENT_ID) {
    return res.status(400).json({ error: "Missing assignment ID or student ID" });
  }

  connection.query(
    "SELECT *, CONCAT('/uploads/', feedback_pdf_filename) AS feedback_pdf FROM submissions WHERE assignment_id = ? AND student_id = ?",
    [ASSIGNMENT_ID, STUDENT_ID],
    (err, result) => {
      if (err) {
        console.error("Error fetching submission:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (result.length === 0) return res.json(null);
      return res.json(result[0]);
    }
  );
});


api.get("/students/get/byUserId", (req, res) => {
  const userId = req.query.USER_ID;
  if (!userId) return res.status(400).json({ error: "Missing user ID" });

  connection.query(
    "SELECT student_id FROM students WHERE user_id = ?",
    [userId],
    (err, result) => {
      if (err) {
        console.error("Error fetching student_id:", err);
        return res.status(500).json({ error: "Database error" });
      }
      if (result.length === 0) return res.status(404).json({ error: "Student not found" });

      return res.json({ student_id: result[0].student_id });
    }
  );
});

api.post("/resources/upload", upload.single("file"), (req, res) => {
  const { assignment_id } = req.body;
  if (!req.file || !assignment_id) {
    return res.status(400).json({ error: "Missing file or assignment_id" });
  }

  const resource_link = `/uploads/${req.file.filename}`;
  const original_name = req.file.originalname;

  connection.query(
    "INSERT INTO resources (assignment_id, resource_link, original_name) VALUES (?, ?, ?)",
    [assignment_id, resource_link, original_name],
    (err) => {
      if (err) {
        console.error("Error inserting resource:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ message: "Resource uploaded", link: resource_link, name: original_name });
    }
  );
});

api.post('/feedback/generate', async (req, res) => {
  const { paper_type, criteria, improvement_notes = "" } = req.body;

  if (!paper_type || !criteria) {
    return res.status(400).json({ error: "Missing paper type or criteria" });
  }

  const prompt = `
You are an IB teacher. Based on these scores and areas to improve, generate concise feedback.

Paper Type: ${paper_type}
Criteria A: ${criteria.A}/ ${paper_type === 'paper 2' ? 10 : 5}
Criteria B: ${criteria.B}/ ${paper_type === 'paper 2' ? 10 : 5}
Criteria C: ${criteria.C}/5
Criteria D: ${criteria.D}/5

Things the student should work on: ${improvement_notes}

Briefly comment on each criterion and offer actionable advice based on the students scoring and the paper type. Avoid generic praise.

After commenting on each criterion offer the student some resources to help them improve their score based on their lowest scoring criteria and what they should work on

Speak in the second person directly to the student
`;

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    });

    const feedback = completion.data.choices[0].message.content.trim();
    res.json({ feedback });
  } catch (err) {
    console.error("GPT error:", err.message);
    res.status(500).json({ error: "Failed to generate feedback" });
  }
});