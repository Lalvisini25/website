<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import BackButton from '@/components/BackButton.vue';

const router = useRouter()
const route = useRoute()
const classroom = ref(null)
const assignments = ref([])

const classroomId = route.params.class_id;

// Navigate to the assignment page with the given id
const goAssignment = (id) => {
    router.push(`/classrooms/${classroomId}/assignments/${id}`)
}

onMounted(async () => {
  try {
    // Get the classroom info from the server
    const classRes = await axios.get("http://localhost:3000/classrooms/get/classInfo", {
      params: { ID: classroomId }
    })
    // Store the classroom data in the reactive reference
    classroom.value = classRes.data

    // Get the assignments for the classroom from the server
    const assignmentRes = await axios.get("http://localhost:3000/assignments/get/class", {
      params: { ID: classroomId }
    })
    // Store the assignments in the reactive reference
    assignments.value = assignmentRes.data

  } catch (error) {
    // Log any errors to the console
    console.log("Error loading classroom or assignments:", error)
  }
})
</script>

<template>
    <div v-if="classroom">
        <h2>Assignments</h2>
        <ul>
            <li v-for="assignment in assignments" :key="assignment.assignment_id">
                <strong>{{ assignment.task_description }}</strong><br />
                Created: {{ new Date(assignment.creation_date).toLocaleDateString() }}<br />
                Deadline: {{ new Date(assignment.deadline_date).toLocaleString() }}
                <br />
                <button @click="goAssignment(assignment.assignment_id)">Open Assignment</button>
                <hr />
            </li>
        </ul>
    </div>

    <div v-else>
        <p>Loading classroom info...</p>
    </div>
    <BackButton />
</template>  
