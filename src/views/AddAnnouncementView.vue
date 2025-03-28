<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import BackButton from '@/components/BackButton.vue';

const router = useRouter()
const route = useRoute();
const classroomId = route.params.class_id;

const title = ref('');
const message = ref('');

const sendAnnouncement = async () => {
  try {
    const payload = {
      title: title.value,
      message: message.value,
      class_id: classroomId
    };

    const response = await axios.post('http://localhost:3000/announcements/add', payload);
    console.log('Announcement sent:', response.data);
    title.value = '';
    message.value = '';
    router.back();
  } catch (error) {
    console.error('Failed to send announcement:', error);
  }
};
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
