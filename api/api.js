import mysql from "mysql";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import { LinkedList } from "../src/utils/Data Structures/LinkedList.js";

//https://www.youtube.com/watch?v=g1lzdoitZkg past 40minutes for authentication

const api = express();
api.use(bodyParser.json());
api.use(cors());

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
  
      // Validate input
      if (!credentials.permission || !credentials.user || !classDetails.class_name || !classDetails.colour || !Array.isArray(classDetails.students)) {
        return res.status(400).json({ error: "Missing required fields" });
      }
  
      if (credentials.permission !== "teacher" && credentials.permission !== "admin") {
        return res.status(401).json({ error: "Invalid credentials" });
      }
  
      // Get teacher_id from user_id
      connection.query("SELECT teacher_id FROM teachers WHERE user_id = ?", [credentials.user], (err, teacherResult) => {
        if (err || teacherResult.length === 0) {
          console.error("Could not find teacher_id for user:", credentials.user);
          return res.status(400).json({ error: "User is not registered as a teacher" });
        }
  
        const teacherId = teacherResult[0].teacher_id;
  
        // Check if class already exists
        connection.query("SELECT class_name FROM classes WHERE class_name = ?", [classDetails.class_name], (err, result) => {
          if (err) {
            console.error("Error checking class existence:", err);
            return res.status(500).json({ error: "Database error while checking class name" });
          }
  
          if (result.length > 0) {
            return res.status(400).json({ error: "Classroom already exists" });
          }
  
          // Insert new class
          connection.query("INSERT INTO classes (teacher_id, class_name, colour) VALUES (?, ?, ?)", [teacherId, classDetails.class_name, classDetails.colour], (err, insertResult) => {
            if (err) {
              console.error("Error inserting class:", err);
              return res.status(500).json({ error: "Failed to insert classroom" });
            }
  
            const classId = insertResult.insertId;
            console.log("New class ID:", classId);
  
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
  const user_id = req.query.ID
  const getStudent = (id) => {
    return new Promise((resolve, reject) => {
        const user = connection.query("SELECT student_id FROM students WHERE user_id = ?", [id], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result[0]);
            }
        })
    })
  }
  const getEnrollments = (id) => {
    return new Promise((resolve, reject) => {
        const user = connection.query("SELECT * FROM class_enrollments WHERE student_id = ?", [id], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        })
    })
  }
  const getClass = (id) => {
    return new Promise((resolve, reject) => {
        const user = connection.query("SELECT * FROM classes WHERE class_id = ?", [id], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result[0]);
            }
        })
    })
  }
  try {
    const student_id = await getStudent(user_id)
    const enrollments = await getEnrollments(student_id)
    const classes = new LinkedList()
    for (let i = 0; i < enrollments.length; i++) {
      const classroom = await getClass(enrollments[i].class_id)
      classes.insertAtTail(classroom)
    }
    return res.json(classes.array())
  } catch (err) {
    return res.status(500).json({ error: "Error processing user data" });
  }
})

api.get("/classrooms/get/classInfo", async (req, res) => {
  const classId = req.query.id;

})

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