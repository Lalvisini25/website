<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import BackButton from '@/components/BackButton.vue';

const route = useRoute();
const router = useRouter();
const classroomId = route.params.class_id;

const title = ref('');
const description = ref('');
const deadline = ref('');
const downloads = ref([]);
const resourceFile = ref(null);

const paperType = ref('none');

const handleFileSelection = (event) => {
  const file = event.target.files[0];
  if (file) {
    resourceFile.value = file;
  }
};

const submitAssignment = async () => {
  try {
    const assignmentPayload = {
      class_id: classroomId,
      deadline_date: deadline.value,
      task_description: `${title.value}\n\n${description.value}`,
      paper_type: paperType.value,
      downloads: downloads.value
    };

    const response = await axios.post("http://localhost:3000/assignments/add", assignmentPayload);
    const assignmentId = response.data.assignment_id;

    if (resourceFile.value) {
      const formData = new FormData();
      formData.append("file", resourceFile.value);
      formData.append("assignment_id", assignmentId);

      await axios.post("http://localhost:3000/resources/upload", formData);
    }

    router.push(`/classrooms/${classroomId}`);
  } catch (error) {
    console.error("Error submitting assignment:", error);
  }
};
</script>

<template>
  <h1>New Assignment</h1>

  <p>Title:</p>
  <input v-model="title" type="text" />

  <p>Description</p>
  <textarea v-model="description" rows="4" cols="50"></textarea>

  <p>Paper Type:</p>
  <select v-model="paperType">
    <option value="none">None</option>
    <option value="paper 1">Paper 1</option>
    <option value="paper 2">Paper 2</option>
  </select>

  <p>Attach a file (optional):</p>
  <input type="file" @change="handleFileSelection" />

  <p>Deadline</p>
  <input v-model="deadline" type="datetime-local" />

  <br /><br />
  <button @click="submitAssignment">Submit</button>
  <br /><br />
  <BackButton />
</template>