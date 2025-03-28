<script setup>
import { reactive, onMounted } from 'vue';
import axios from 'axios';
import { useStore } from 'vuex';
import router from '@/router';
import { LinkedList } from '@/utils/Data Structures/LinkedList';

const store = useStore();

const state = reactive({
  class_name: "",
  colour: "#808080",
  students: new LinkedList(),
  classStudents: new LinkedList(),
  addClassroomResponse: ""
});

const addStudent = (student) => {
  state.classStudents.insertAtTail(student);
  if (state.students.contains(student)) {
    state.students.remove(student);
  }
};

const removeStudent = (student) => {
  state.students.insertAtTail(student);
  if (state.classStudents.contains(student)) {
    state.classStudents.remove(student);
  }
};

const handleAdd = async () => {
  const details = {
    PERMISSIONS: store.getters.getPermissions,
    ID: store.getters.getId,
    NAME: state.class_name,
    COLOUR: state.colour,
    STUDENTS: state.classStudents.array()
  };

  try {
    const response = await axios.post("http://localhost:3000/classrooms/add", details);
    router.push(`/classrooms/${response.data.class_id}`);
  } catch (error) {
    console.error("Error creating classroom:", error);
    state.addClassroomResponse = error.response?.data?.error || "An unknown error occurred.";
  }
};

onMounted(async () => {
  try {
    const response = await axios.get("http://localhost:3000/students/get");
    response.data.forEach(student => state.students.insertAtTail(student));
  } catch (error) {
    console.error('Error fetching students:', error);
  }
});
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
