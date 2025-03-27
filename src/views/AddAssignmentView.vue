<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const classroomId = route.params.id;

const title = ref('');
const description = ref('');
const deadline = ref('');
const downloadInput = ref('');
const downloads = ref([]);

const addDownload = () => {
  if (downloadInput.value.trim()) {
    downloads.value.push(downloadInput.value.trim());
    downloadInput.value = '';
  }
};

const removeDownload = (index) => {
  downloads.value.splice(index, 1);
};

const submitAssignment = async () => {
  try {
    const response = await axios.post("http://localhost:3000/assignments/add", {
      class_id: classroomId,
      deadline_date: deadline.value,
      task_description: `${title.value}\n\n${description.value}`
    });
    console.log(response)
    alert("Assignment added!");
    router.push(`/classrooms/${classroomId}`);
  } catch (error) {
    console.error("Error submitting assignment:", error);
    alert("Failed to add assignment");
  }
};
</script>

<template>
  <h1>New Assignment</h1>

  <p>Title:</p>
  <input v-model="title" type="text" />

  <p>Description</p>
  <textarea v-model="description" rows="4" cols="50"></textarea>

  <p>Downloads</p>
  <div v-for="(file, index) in downloads" :key="index">
    <span>{{ file }}</span>
    <button @click="removeDownload(index)">X</button>
  </div>
  <input
    v-model="downloadInput"
    @keyup.enter="addDownload"
    type="text"
    placeholder="Add download"
  />
  <button @click="addDownload">Add download</button>

  <p>Deadline</p>
  <input v-model="deadline" type="datetime-local" />

  <br /><br />
  <button @click="submitAssignment">Submit</button>
</template>
