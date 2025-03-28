<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import BackButton from '@/components/BackButton.vue';
import { useStore } from 'vuex';

const route = useRoute();
const router = useRouter();
const classId = route.params.class_id;
const assignmentId = route.params.assignment_id;

const assignment = ref(null);
const submission = ref(null); // uploaded file
const existingSubmission = ref(null); // existing submission record
const fileInput = ref(null);
const store = useStore();

const studentId = ref(null);

const fetchStudentId = async () => {
  try {
    const res = await axios.get("http://localhost:3000/students/get/byUserId", {
      params: { USER_ID: store.getters.getId }
    });
    studentId.value = res.data.student_id;
  } catch (error) {
    console.error("Failed to get student_id:", error);
  }
};

const fetchAssignment = async () => {
  try {
    const response = await axios.get("http://localhost:3000/assignments/get", {
      params: { CLASS_ID: classId, ASSIGNMENT_ID: assignmentId }
    });
    assignment.value = response.data;
  } catch (error) {
    console.error("Failed to fetch assignment:", error);
  }
};

const fetchExistingSubmission = async () => {
  try {
    await fetchStudentId();
    const res = await axios.get('http://localhost:3000/submissions/get/student', {
      params: {
        ASSIGNMENT_ID: assignmentId,
        STUDENT_ID: studentId.value
      }
    });
    if (res.data) {
      existingSubmission.value = res.data;
    }
  } catch (err) {
    console.error("Failed to fetch existing submission:", err);
  }
};

const handleFileUpload = (event) => {
  submission.value = event.target.files[0];
};

const removeSubmission = () => {
  submission.value = null;
  fileInput.value.value = ""; // reset input
};

const submitAssignment = async () => {
  await fetchStudentId(); // 🛠️ Make sure we actually have studentId before submitting

  if (!submission.value || !studentId.value) {
    console.error("Missing submission or student ID", { submission: submission.value, studentId: studentId.value });
    return;
  }

  const formData = new FormData();
  formData.append('file', submission.value);
  formData.append('assignment_id', assignmentId);
  formData.append('student_id', studentId.value);

  try {
    const response = await axios.post('http://localhost:3000/assignments/submit', formData);
    console.log("Submission success:", response.data);
    await fetchExistingSubmission();
    submission.value = null;
    router.back();
  } catch (error) {
    console.error("Submission failed:", error.response?.data || error.message);
  }
};

onMounted(async () => {
  await fetchAssignment();
  await fetchExistingSubmission();
});
</script>

<template>
  <div v-if="assignment">
    <h2>{{ assignment.task_description }}</h2>
    <p><strong>Type:</strong> {{ assignment.paper_type || 'None' }}</p>
    <p>{{ assignment.details }}</p>

    <div>
      <h4>Attached Resources:</h4>
      <ul v-if="assignment.resources && Array.isArray(assignment.resources)">
        <li v-for="resource in assignment.resources" :key="resource.resource_link">
          <a :href="`http://localhost:3000${resource.resource_link}`" target="_blank" rel="noopener noreferrer">
            {{ resource.original_name || resource.resource_link?.split('/').pop() }}
          </a>
        </li>
      </ul>
      <p v-else>No resources attached.</p>
    </div>

    <p><strong>Deadline:</strong> {{ new Date(assignment.deadline_date).toLocaleDateString() }}</p>

    <div>
      <h4>Your Submission:</h4>
      <div v-if="existingSubmission?.file_path">
        <p>
          Submitted on: {{ new Date(existingSubmission.submission_date).toLocaleString() }}<br />
          <a
            :href="`http://localhost:3000${existingSubmission.file_path}`"
            download
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ existingSubmission.file_path.split('/').pop() }}
          </a>
          <br /><br />
          Grade: {{ existingSubmission.grade ?? 'Unmarked' }}
          <span v-if="assignment.paper_type === 'paper 1'">(Max: 20)</span>
          <span v-else-if="assignment.paper_type === 'paper 2'">(Max: 30)</span>
          <br /><br />
          <strong>Feedback File: </strong>
          <a
            v-if="existingSubmission.feedback_pdf"
            :href="`http://localhost:3000${existingSubmission.feedback_pdf}`"
            download
            target="_blank"
            rel="noopener noreferrer"
          >
          Download Feedback PDF
          </a>
          <span v-else>No feedback file available</span>

        </p>
      </div>
      <div v-else>
        <p>No submission yet.</p>
      </div>

      <h4>Upload New File:</h4>
      <input type="file" ref="fileInput" @change="handleFileUpload" />
      <div v-if="submission">
        <p>{{ submission.name }} <button @click="removeSubmission">Remove</button></p>
      </div>
      <button @click="submitAssignment">SUBMIT</button>
    </div>
  </div>

  <div v-else>
    <p>Loading assignment...</p>
  </div>
  <br />
  <BackButton />
</template>