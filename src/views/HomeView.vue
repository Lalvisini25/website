<script setup>
import { useStore } from 'vuex';
import { computed } from 'vue';

const store = useStore();

import router from "@/router";

const sendLogin = () => {
  router.push('/login')
}

const sendSignup = () => {
  router.push('/signup')
}

const pushAddClassroom = () => {
  router.push('/classrooms/add')
}

const isTeacherOrAdmin = computed(() => {
  if (store.getters.getPermissions == "teacher" || store.getters.getPermissions == "admin") {
    return true
  } else {
    return false
  }
})
</script>

<template>
  <h1 v-if="!store.getters.isLoggedIn">You are not logged in</h1>
  <button v-if="!store.getters.isLoggedIn" @click="sendLogin">Login</button>
  <button v-if="!store.getters.isLoggedIn" @click="sendSignup">Signup</button>
  <h1 v-if="store.getters.isLoggedIn"> Logged in</h1>
  <p v-if="store.getters.isLoggedIn">{{ store.getters.getPermissions }}</p>
  <button v-if="isTeacherOrAdmin" @click="pushAddClassroom">Add classroom</button>
</template>