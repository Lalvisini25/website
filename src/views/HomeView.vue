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
    const response = await axios.get("http://localhost:3000/classrooms/get", {
      params: { ID: store.getters.getId }
    });

    const classData = response.data;

    // Fetch teacher usernames for each class
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

  <h1 v-else>Logged in</h1>
  <p>{{ store.getters.getPermissions }}</p>

  <button v-if="isTeacherOrAdmin" @click="pushAddClassroom">Add classroom</button>

  <div v-for="classroom in classes" :key="classroom.class_id">
    <ClassroomContainer
      :name="classroom.class_name"
      :teacher="classroom.teacher"
      :headerColour="classroom.colour"
      :id="classroom.class_id"
    />
  </div>
</template>