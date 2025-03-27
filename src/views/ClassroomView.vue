<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();

const classroomId = route.params.id;

onMounted(async() => {
    try {
        const response = await axios.get("http://localhost:3000/classrooms/get/classInfo", {
            params: { ID: classroomId }
        })
        console.log(response)
    } catch (error) {
        console.log(error)
    }
})
</script>

<template>
    {{ claassroomId }}
</template>