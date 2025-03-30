<script setup>
import { defineProps } from 'vue';
import router from '@/router';

const props = defineProps({
  // The name of the classroom
  name: {
    type: String,
    default: 'Unnamed Class'
  },
  // The teacher of the classroom
  teacher: {
    type: Object,
    default: () => ({ username: 'Unknown Teacher' })
  },
  // The hex color of the header
  headerColour: {
    type: String,
    default: '#808080'
  },
  // The id of the classroom
  id: {
    type: Number,
    default: 4
  }
})

// Go to the classroom page with the given id
const goClassroom = () => {
  // Push the route to the classroom page
  router.push(`/classrooms/${props.id}`)
}
</script>


<template>
  <div class="rounded-2xl shadow-md overflow-hidden border w-full max-w-md">
    <div class="p-4" :style="{ backgroundColor: headerColour }">
      <h2 class="text-xl font-bold text-white">{{ name }}</h2>
    </div>
    <div class="p-4 bg-white">
      <p class="text-sm text-gray-700">Teacher: <span class="font-medium">{{ teacher.username }}</span></p>
    </div>
  </div>
  <button @click="goClassroom">Go to classroom</button>
</template>
