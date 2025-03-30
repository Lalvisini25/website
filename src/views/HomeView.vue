<script setup>
import { useStore } from 'vuex';
import { ref, computed, onMounted } from 'vue';
import ClassroomContainer from '@/components/ClassroomContainer.vue';
import router from "@/router";
import axios from 'axios';

const store = useStore()
const classes = ref([])

// Navigate to the login page
const sendLogin = () => {
  router.push('/login')
}

// Navigate to the signup page
const sendSignup = () => {
  router.push('/signup')
}

// Navigate to the add classroom page
const pushAddClassroom = () => {
  router.push('/classrooms/add')
}

// Computed property to determine if the user is a teacher or an admin
const isTeacherOrAdmin = computed(() => 
  store.getters.getPermissions === "teacher" || store.getters.getPermissions === "admin"
)

// Function to get teacher info from the server
// Takes a teacher ID, fetches the teacher from the server
// Returns the teacher's username
const getTeacher = async (id) => {
  try {
    const response = await axios.get("http://localhost:3000/teacher/get", {
      params: { ID: id }
    })
    return response.data.teacher
  } catch (error) {
    // Handles error by logging it to the console and returning a username object with the value of Unknown
    console.error("Failed to fetch teacher:", error)
    return { username: "Unknown" }
  }
}

onMounted(async () => {
  try {
    // If the user is a student, get the classrooms from the server
    // using the student's ID and permission
    // If the user is a teacher or admin, get the teacher's ID
    // and use it to get the classrooms from the server
    let classData = {}
    if (store.getters.getPermissions === "student") {
      const response = await axios.get("http://localhost:3000/classrooms/get", {
        params: { 
          ID: store.getters.getId,
          PERMISSION: store.getters.getPermissions
        }
      })
      classData = response.data
    } else {
      const teacher = await axios.get("http://localhost:3000/teacher/get/user", {
        params: {
          ID: store.getters.getId
        }
      })
      const teacher_id = teacher.data.teacher_id
      const response = await axios.get("http://localhost:3000/classrooms/get", {
        params: { 
          ID: store.getters.getId,
          PERMISSION: store.getters.getPermissions,
          TEACHER_ID: teacher_id
        }
      })
      console.log(response)
      classData = response.data
    }

    // For each classroom, get the teacher's username
    // and add it to the classroom object
    for (const classroom of classData) {
      const teacher = await getTeacher(classroom.teacher_id)
      classroom.teacher = teacher
    }

    // Set the reactive reference to the array of classrooms
    classes.value = classData
  } catch (error) {
    // Log any errors to the console
    console.error("Error loading classrooms:", error)
  }
})
</script>

<template>
  <h1 v-if="!store.getters.isLoggedIn">You are not logged in</h1>
  <button v-if="!store.getters.isLoggedIn" @click="sendLogin">Login</button>
  <button v-if="!store.getters.isLoggedIn" @click="sendSignup">Signup</button>

  <h1 v-else>Classes</h1>

  <div v-if="classes.length > 0 && store.getters.isLoggedIn">
    <div v-for="classroom in classes" :key="classroom.class_id">
      <ClassroomContainer
        :name="classroom.class_name"
        :teacher="classroom.teacher"
        :headerColour="classroom.colour"
        :id="classroom.class_id"
      />
    </div>
  </div>
  <div v-else-if="store.getters.isLoggedIn">
    <p>No classrooms found.</p>
  </div>
  
  <br />

  <button v-if="isTeacherOrAdmin" @click="pushAddClassroom">Add classroom</button>
</template>
