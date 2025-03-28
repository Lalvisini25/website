<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import BackButton from '@/components/BackButton.vue';

const router = useRouter();
const route = useRoute();
const submissionId = route.params.submission_id;

const submission = ref(null);
const loading = ref(true);
const grade = ref(null);
const feedback = ref('');
const paperType = ref('none');
const criteriaGrades = ref({ A: null, B: null, C: null, D: null });
const improvementNotes = ref(''); // 🆕 input from teacher

const calculateTotalGrade = () => {
  if (paperType.value === 'paper 1' || paperType.value === 'paper 2') {
    return (
      (criteriaGrades.value.A || 0) +
      (criteriaGrades.value.B || 0) +
      (criteriaGrades.value.C || 0) +
      (criteriaGrades.value.D || 0)
    );
  }
  return grade.value;
};

const generateFeedback = async () => {
  try {
    const res = await axios.post('http://localhost:3000/feedback/generate', {
      paper_type: paperType.value,
      criteria: criteriaGrades.value,
      improvement_notes: improvementNotes.value // 🆕 send to backend
    });
    feedback.value = res.data.feedback;
  } catch (err) {
    console.error("Failed to generate feedback:", err);
  }
};

const submitGrade = async () => {
  try {
    const cleanSubmission = {
      submission_id: submission.value.submission_id,
      grade: calculateTotalGrade(),
      feedback: feedback.value
    };
    await axios.post("http://localhost:3000/submissions/grade", cleanSubmission);
    router.back();
  } catch (error) {
    console.error('Error submitting grade/feedback:', error);
  }
};

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:3000/submissions/get/single', {
      params: { SUBMISSION_ID: submissionId }
    });
    submission.value = response.data;
    grade.value = submission.value.grade;
    feedback.value = submission.value.feedback;

    const assignmentRes = await axios.get('http://localhost:3000/assignments/get', {
      params: {
        CLASS_ID: submission.value.class_id,
        ASSIGNMENT_ID: submission.value.assignment_id
      }
    });
    paperType.value = assignmentRes.data.paper_type;

    if (paperType.value !== 'none' && submission.value.grade !== null) {
      const total = submission.value.grade;
      if (paperType.value === 'paper 1') {
        criteriaGrades.value.A = criteriaGrades.value.B = criteriaGrades.value.C = criteriaGrades.value.D = Math.min(5, Math.floor(total / 4));
      } else if (paperType.value === 'paper 2') {
        criteriaGrades.value.A = criteriaGrades.value.B = Math.min(10, Math.floor(total / 4));
        criteriaGrades.value.C = criteriaGrades.value.D = Math.min(5, Math.floor(total / 4));
      }
    }
  } catch (error) {
    console.error("Error fetching submission or assignment:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <h2>Submission Details</h2>

    <div v-if="loading">Loading...</div>

    <div v-else-if="submission">
      <p><strong>Student:</strong> {{ submission.student_name }}</p>
      <p><strong>Submitted on:</strong> {{ new Date(submission.submission_date).toLocaleString() }}</p>
      <p><strong>Grade:</strong> {{ submission.grade ?? 'Unmarked' }}</p>
      <p><strong>Feedback:</strong> {{ submission.feedback ?? 'None' }}</p>

      <h2><strong>Submission:</strong></h2>
      <div v-if="submission.file_path">
        <a :href="`http://localhost:3000${encodeURI(submission.file_path)}`" target="_blank" rel="noopener noreferrer">
          {{ submission.file_path.split('/').pop() }}
        </a>
      </div>

      <div>
        <h3>Update Grade & Feedback</h3>

        <div v-if="paperType === 'paper 1' || paperType === 'paper 2'">
          <div>
            <label>Criteria A (max {{ paperType === 'paper 2' ? 10 : 5 }}):</label>
            <input type="number" v-model.number="criteriaGrades.A" :max="paperType === 'paper 2' ? 10 : 5" min="0" />
          </div>
          <div>
            <label>Criteria B (max {{ paperType === 'paper 2' ? 10 : 5 }}):</label>
            <input type="number" v-model.number="criteriaGrades.B" :max="paperType === 'paper 2' ? 10 : 5" min="0" />
          </div>
          <div>
            <label>Criteria C (max 5):</label>
            <input type="number" v-model.number="criteriaGrades.C" max="5" min="0" />
          </div>
          <div>
            <label>Criteria D (max 5):</label>
            <input type="number" v-model.number="criteriaGrades.D" max="5" min="0" />
          </div>
          <p><strong>Total Grade:</strong> {{ calculateTotalGrade() }}</p>
        </div>

        <div v-else>
          <label>Grade (0–7):</label>
          <input type="number" v-model.number="grade" min="0" max="7" />
        </div>

        <div>
          <label>What should the student work on?</label>
          <br />
          <textarea v-model="improvementNotes" rows="5" cols="150" placeholder="e.g. Improve structure and analysis..."></textarea>
        </div>

        <br />
        <button @click="generateFeedback">Generate AI Feedback</button>
        <br /><br />
        <textarea v-model="feedback" placeholder="Feedback" rows="30" cols="150"></textarea>
        <br />
        <button @click="submitGrade">Complete</button>
      </div>
    </div>

    <div v-else>
      <p>Submission not found.</p>
    </div>

    <br />
    <BackButton />
  </div>
</template>
