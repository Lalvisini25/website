<script setup>
import AddClassroomBox from '@/components/AddClassroomBox.vue';
import BackButton from '@/components/BackButton.vue';
import { useStore } from 'vuex';

const store = useStore();
</script>

<template>
    <AddClassroomBox v-if="store.getters.isLoggedIn" />
    <h2 v-if="!store.getters.isLoggedIn">Not logged in</h2>
    <br /><br />
    <BackButton />
</template>