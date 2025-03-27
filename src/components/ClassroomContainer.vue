<script setup>
import { defineProps } from 'vue';
import router from '@/router';

const props = defineProps({
  name: {
    type: String,
    default: 'Unnamed Class',
  },
  teacher: {
    type: Object,
    default: () => ({ username: 'Unknown Teacher' }),
  },
  headerColour: {
    type: String,
    default: 'gray',
  },
  id: {
    type: Number,
    default: 4,
  }
});

const goClassroom = () => {
  router.push(`/classrooms/${props.id}`);
};
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
