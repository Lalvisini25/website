<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useStore } from 'vuex';
import BackButton from '@/components/BackButton.vue';

const router = useRouter()
const route = useRoute()
const store = useStore()
const classroom = ref(null)
const feed = ref([])

const classroomId = route.params.id;

// A computed property that returns true if the user is a teacher
// and false otherwise.
const isTeacher = computed(() => {
  return store.getters.getPermissions === "teacher"
})

// This function is used to navigate to the add assignment page
// It takes no parameters and returns no value
const sendAddAssignment = () => {
  router.push(`/classrooms/${classroomId}/addAssignment`)
}

// This function is used to navigate to the add announcement page
// It takes no parameters and returns no value
const sendAddAnnouncement = () => {
  router.push(`/classrooms/${classroomId}/addAnnouncement`)
}

// This function is used to navigate to the classroom assignments page
// It takes no parameters and returns no value
const sendAssignments = () => {
  router.push(`/classrooms/${classroomId}/assignments/`)
}

// This function is used to navigate to the assignment page with the given id
// It takes the id of the assignment as a parameter and returns no value
const goAssignment = (id) => {
  router.push(`/classrooms/${classroomId}/assignments/${id}`)
}

onMounted(async () => {
  try {
    // Get classroom info from server
    const classRes = await axios.get("http://localhost:3000/classrooms/get/classInfo", {
      params: { ID: classroomId }
    })
    // Store the classroom data in the reactive reference
    classroom.value = classRes.data

    // Get assignments for the classroom from server
    const assignmentRes = await axios.get("http://localhost:3000/assignments/get/class", {
      params: { ID: classroomId }
    })
    // Create an array of objects from the assignments
    // Each object has the following properties: type, id, date, deadline, description
    const assignments = assignmentRes.data.map(a => ({
      type: "assignment",
      id: a.assignment_id,
      date: new Date(a.creation_date),
      deadline: new Date(a.deadline_date),
      description: a.task_description
    }))

    // Get announcements for the classroom from server
    const announcementRes = await axios.get("http://localhost:3000/announcements/get/class", {
      params: { ID: classroomId }
    })
    // Create an array of objects from the announcements
    // Each object has the following properties: type, id, date, title, message
    const announcements = announcementRes.data.map(a => ({
      type: "announcement",
      id: a.announcement_id,
      date: new Date(a.date_created),
      title: a.title,
      message: a.message
    }))

    // Combine the assignments and announcements in a single array
    // Sort the array by the date in descending order
    feed.value = [...assignments, ...announcements].sort((a, b) => b.date - a.date)

  } catch (error) {
    console.log("Error loading classroom or feed:", error)
  }
})
</script>

<template>
  <div v-if="classroom">
    <h1>{{ classroom.class_name }}</h1>
    <p>Teacher: {{ classroom.teacher?.username }}</p>

    <button @click="sendAssignments">View assignments</button>
    <br />
    <button v-if="isTeacher" @click="sendAddAnnouncement">New announcement</button>
    <br />
    <button v-if="isTeacher" @click="sendAddAssignment">Add assignments</button>

    <h2>Feed</h2>
      <ul>
        <li
          v-for="item in feed"
          :key="item.type + '-' + item.id"
        >
          <strong v-if="item.type === 'assignment'">New assignment: {{ item.description }}</strong>
          <strong v-else-if="item.type === 'announcement'">New annnouncement: {{ item.title }}</strong><br />

          <span v-if="item.type === 'assignment'">
            Created: {{ item.date.toLocaleDateString() }}<br />
            Deadline: {{ item.deadline.toLocaleString() }}<br />
            <button @click="goAssignment(item.id)">Open Assignment</button>
          </span>

          <span v-else-if="item.type === 'announcement'">
            Posted: {{ item.date.toLocaleString() }}<br />
            Message: {{ item.message }}
          </span>

          <hr />
        </li>
      </ul>

  </div>

  <div v-else>
    <p>Loading classroom info...</p>
  </div>

  <br />
  <BackButton />
</template>