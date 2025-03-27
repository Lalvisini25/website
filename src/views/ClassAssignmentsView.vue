<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const classroom = ref(null);
const assignments = ref([]);

const classroomId = route.params.id;

onMounted(async () => {
  try {
    const classRes = await axios.get("http://localhost:3000/classrooms/get/classInfo", {
      params: { ID: classroomId }
    });
    classroom.value = classRes.data;

    const assignmentRes = await axios.get("http://localhost:3000/assignments/get/class", {
      params: { ID: classroomId }
    });
    assignments.value = assignmentRes.data;

  } catch (error) {
    console.log("Error loading classroom or assignments:", error);
  }
});
</script>

<template>
    <div v-if="classroom">
      <h2>Assignments</h2>
      <ul>
        <li v-for="assignment in assignments" :key="assignment.assignment_id">
            <strong>{{ assignment.task_description }}</strong><br />
            Created: {{ new Date(assignment.creation_date).toLocaleDateString() }}<br />
            Deadline: {{ new Date(assignment.deadline_date).toLocaleString() }}
            <hr />
        </li>
      </ul>
    </div>

    <div v-else>
      <p>Loading classroom info...</p>
    </div>
  </template>  
