<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import BackButton from '@/components/BackButton.vue';

const router = useRouter()
const route = useRoute()
const classroomId = route.params.class_id

// Create refs to hold the title and message of the announcement
const title = ref('')
const message = ref('')

const sendAnnouncement = async () => {
  try {
    // Create the payload object containing the announcement title message and class id
    const payload = {
      title: title.value,
      message: message.value,
      class_id: classroomId
    }
    // Post the payload to the server
    const response = await axios.post('http://localhost:3000/announcements/add', payload)
    // Log the response
    console.log('Announcement sent:', response.data)
    // Reset the input fields
    title.value = ''
    message.value = ''
    // Return to the previous page
    router.back()
  } catch (error) {
    // Log the error
    console.error('Failed to send announcement:', error)
  }
}
</script>

<template>
  <h1>New Announcement</h1>

  <label>
    Title:
    <input type="text" v-model="title" />
  </label>

  <br /><br />

  <textarea
    placeholder="Enter message..."
    v-model="message"
    rows="8"
    cols="50"
  ></textarea>

  <br /><br />

  <button @click="sendAnnouncement">SEND</button>
  <br /><br />
  <BackButton />
</template>
