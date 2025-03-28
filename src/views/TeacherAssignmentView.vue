<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import BackButton from '@/components/BackButton.vue';

const route = useRoute();
const router = useRouter();
const classId = route.params.class_id;
const assignmentId = route.params.assignment_id;

const submissions = ref([]);
const loading = ref(true);
const assignment = ref(null);

const goToSubmission = (submissionId) => {
  router.push(`${assignmentId}/submission/${submissionId}`);
};

onMounted(async () => {
  try {
    const assignmentRes = await axios.get("http://localhost:3000/assignments/get", {
      params: {
        CLASS_ID: classId,
        ASSIGNMENT_ID: assignmentId
      }
    });
    assignment.value = assignmentRes.data;

    const res = await axios.get("http://localhost:3000/submissions/get/class", {
      params: {
        CLASS_ID: classId,
        ASSIGNMENT_ID: assignmentId
      }
    });
    submissions.value = res.data;
  } catch (error) {
    console.error("Error loading submissions:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <h2>Student Submissions</h2>

    <div v-if="loading">
      Loading...
    </div>

    <table v-else>
      <thead>
        <tr>
          <th>Status</th>
          <th>Student</th>
          <th>File(s)</th>
          <th>Grade</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="submission in submissions" :key="submission.student_id">
          <td>
            <span v-if="submission.file_path">
              <span v-if="new Date(submission.submission_date) <= new Date(submission.deadline_date)">EARLY</span>
              <span v-else>LATE</span>
            </span>
            <span v-else>WAITING</span>
          </td>
          <td>{{ submission.student_name }}</td>
          <td>
            <div v-if="submission.file_path">
              <a href="#" @click.prevent="goToSubmission(submission.submission_id)">
                {{ submission.file_path.split('/').pop() }}
              </a>
            </div>
            <div v-else>
              No Submissions
            </div>
          </td>
          <td>
            <div v-if="submission.grade !== null">
              {{ submission.grade }}/
              <span v-if="assignment?.paper_type === 'paper 1'">20</span>
              <span v-else-if="assignment?.paper_type === 'paper 2'">30</span>
              <span v-else>100</span>
            </div>
            <div v-else>
              Unmarked
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <br />
    <BackButton />
  </div>
</template>