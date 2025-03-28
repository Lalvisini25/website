<script setup>
import { useStore } from 'vuex';
import { ref, computed, onMounted } from 'vue';
import ClassroomContainer from '@/components/ClassroomContainer.vue';
import router from "@/router";
import axios from 'axios';

const store = useStore();
const classes = ref([]);

const sendLogin = () => router.push('/login');
const sendSignup = () => router.push('/signup');
const pushAddClassroom = () => router.push('/classrooms/add');

const isTeacherOrAdmin = computed(() =>
  store.getters.getPermissions === "teacher" || store.getters.getPermissions === "admin"
);

const getTeacher = async (id) => {
  try {
    const response = await axios.get("http://localhost:3000/teacher/get", {
      params: { ID: id }
    });
    return response.data.teacher;
  } catch (error) {
    console.error("Failed to fetch teacher:", error);
    return { username: "Unknown" };
  }
};

onMounted(async () => {
  try {
    let classData = {}
    if (store.getters.getPermissions === "student") {
      const response = await axios.get("http://localhost:3000/classrooms/get", {
        params: { 
          ID: store.getters.getId,
          PERMISSION: store.getters.getPermissions
        }
      });
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
      });
      console.log(response)
      classData = response.data
    }

    for (const classroom of classData) {
      const teacher = await getTeacher(classroom.teacher_id);
      classroom.teacher = teacher;
    }

    classes.value = classData;
  } catch (error) {
    console.error("Error loading classrooms:", error);
  }
});
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
