<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

// This component provides a button to go back to the previous page in the browser history.
// router.back() is called when the button is clicked.
const goBack = () => {
  router.back()
}
</script>

<template>
  <button @click="goBack">
    Back
  </button>
</template>
