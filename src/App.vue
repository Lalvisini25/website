<script setup>
import { useStore } from "vuex";
import { useRoute, useRouter, RouterView } from "vue-router";
import NavBar from "./components/NavBar.vue";
import { watchEffect } from "vue";

const store = useStore();
const route = useRoute();
const router = useRouter();

watchEffect(() => {
  const isLoggedIn = store.getters.isLoggedIn;
  const publicRoutes = ['login', 'signup'];

  if (!isLoggedIn && !publicRoutes.includes(route.name)) {
    router.push('/');
  }
});
</script>

<template>
  <NavBar v-if="store.getters.isLoggedIn" />
  <RouterView />
</template>

<style>
</style>
