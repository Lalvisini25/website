<script setup>
import { useStore } from 'vuex';

const store = useStore();

import router from "@/router";

const sendLogin = () => {
  router.push('/login')
}

const sendSignup = () => {
  router.push('/signup')
}
</script>

<template>
  <h1 v-if="!store.getters.isLoggedIn">You are not logged in</h1>
  <button v-if="!store.getters.isLoggedIn" @click="sendLogin">Login</button>
  <button v-if="!store.getters.isLoggedIn" @click="sendSignup">Signup</button>
  <h1 v-if="store.getters.isLoggedIn"> Logged in</h1>
</template>