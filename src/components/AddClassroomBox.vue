<script setup>
import { reactive, onMounted } from 'vue';
import axios from 'axios';
import { useStore } from 'vuex';
import router from '@/router';
import { LinkedList } from '@/utils/Data Structures/LinkedList';

// Imports the store object from the Vuex store
const store = useStore();

// reactive() creates a reactive state object
// The state object is used to store the name and colour of the classroom
// as well as two linked lists, one for all students and one for students in the classroom
const state = reactive({
  class_name: "", // name of the classroom
  colour: "#808080", // default colour for the classroom
  students: new LinkedList(), // linked list of all students
  classStudents: new LinkedList(), // linked list of students in the classroom
  addClassroomResponse: "" // response from the server after adding a classroom
})

const addStudent = (student) => {
  // Add a student to the classroom's linked list
  state.classStudents.insertAtTail(student)
  // Remove the student from the list of all students if they are already there
  if (state.students.contains(student)) {
    state.students.remove(student)
  }
}

const removeStudent = (student) => {
  // Insert the student into the list of all students to remove them from the classroom
  state.students.insertAtTail(student);
  // Remove the student from the classroom's linked list if they are already there
  if (state.classStudents.contains(student)) {
    state.classStudents.remove(student);
  }
}

const handleAdd = async () => {
  // Send a POST request to the server to add a classroom
  // The request body contains the class name, colour, and students
  // The server will add the classroom and return the class ID
  const details = {
    PERMISSIONS: store.getters.getPermissions,
    ID: store.getters.getId,
    NAME: state.class_name,
    COLOUR: state.colour,
    STUDENTS: state.classStudents.array()
  };

  try {
    // Send the request and get the response
    const response = await axios.post("http://localhost:3000/classrooms/add", details)
    // Redirect to the classroom page if the request is successful
    router.push(`/classrooms/${response.data.class_id}`)
  } catch (error) {
    // Handle any errors that occur during the request
    console.error("Error creating classroom:", error);
    // Store the error message for display in the UI
    state.addClassroomResponse = error.response?.data?.error || "An unknown error occurred."
  }
}

onMounted(async () => {
  try {
    // Get all students from the server
    const response = await axios.get("http://localhost:3000/students/get")

    // Insert each student into the linked list
    response.data.forEach(student => state.students.insertAtTail(student))
  } catch (error) {
    console.error('Error fetching students:', error)
  }
})
</script>

<template>
  <h2>Add Classroom</h2>

  <input type="text" v-model="state.class_name" placeholder="Enter class name" required />
  <br /><br />


  <label for="colour-picker">Choose a color:</label>
  <input type="color" id="colour-picker" v-model="state.colour" />
  <br />

  <h3>Available Students ({{ state.students.size() }})</h3>
  <ul>
    <li v-for="student in state.students.array()" :key="student.student_id">
      {{ student.username }}
      <button @click="addStudent(student)">+</button>
    </li>
  </ul>

  <h3>Students in class: {{ state.class_name }} ({{ state.classStudents.size() }}) </h3>

  <ul>
    <li v-for="student in state.classStudents.array()" :key="student.student_id">
      {{ student.username }}
      <button @click="removeStudent(student)">-</button>
    </li>
  </ul>

  <button :disabled="!state.class_name" @click="handleAdd()">Create</button>

  <p v-if="state.addClassroomResponse" style="color: red;">
    {{ state.addClassroomResponse }}
  </p>
</template>