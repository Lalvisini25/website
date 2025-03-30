<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import BackButton from '@/components/BackButton.vue';

const route = useRoute()
const assignmentId = route.params.assignment_id;
const classId = route.params.class_id;
const resources = ref([])
const loading = ref(true)

console.log(classId)

onMounted(async () => {
  try {
    // Make a GET request to the server to get the resources for the assignment
    // with the given assignment ID
    const response = await axios.get("http://localhost:3000/assignments/get/resources", {
      params: { ASSIGNMENT_ID: assignmentId }
    })
    // Store the resources in the reactive reference
    resources.value = response.data
  } catch (error) {
    // Log any errors to the console
    console.error("Failed to load resources:", error)
  } finally {
    // Set the loading flag to false
    loading.value = false
  }
})
</script>

<template>
  <div>
    <h2>Resources for Assignment</h2>

    <div v-if="loading">
      Loading resources...
    </div>

    <ul v-else-if="resources.length > 0">
      <li v-for="resource in resources" :key="resource.resource_link">
        <a :href="`http://localhost:3000${resource.resource_link}`" target="_blank" rel="noopener noreferrer">
          {{ resource.original_name || resource.resource_link.split('/').pop() }}
        </a>
      </li>
    </ul>

    <div v-else>
      <p>No resources found for this assignment.</p>
    </div>

    <br />
    <BackButton />
  </div>
</template>