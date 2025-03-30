<script setup>
// This component renders a navigation bar with links to the home page and the chat page.
import { RouterLink } from 'vue-router';
</script>

<template>
    <RouterLink to="/">Home    </RouterLink>
    <RouterLink to="/chat">Chat    </RouterLink>
    <br />
</template>