<script setup>
import { useStore } from "vuex";
import NavBar from "./components/NavBar.vue";
import { RouterView } from "vue-router";

const store = useStore();

</script>

<template>
  <NavBar v-if="store.getters.isLoggedIn" />
  <RouterView />
</template>

<style>

</style>