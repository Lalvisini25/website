<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useStore } from 'vuex';
import BackButton from '@/components/BackButton.vue';

const router = useRouter();
const route = useRoute();
const store = useStore();
const classroom = ref(null);
const feed = ref([]);

const classroomId = route.params.id;

const isTeacher = computed(() =>
  store.getters.getPermissions === "teacher"
);

const sendAddAssignment = () => {
  router.push(`/classrooms/${classroomId}/addAssignment`);
};

const sendAddAnnouncement = () => {
  router.push(`/classrooms/${classroomId}/addAnnouncement`);
};

const sendAssignments = () => {
  router.push(`/classrooms/${classroomId}/assignments/`);
};

const goAssignment = (id) => {
  router.push(`/classrooms/${classroomId}/assignments/${id}`);
};

onMounted(async () => {
  try {
    const classRes = await axios.get("http://localhost:3000/classrooms/get/classInfo", {
      params: { ID: classroomId }
    });
    classroom.value = classRes.data;

    const assignmentRes = await axios.get("http://localhost:3000/assignments/get/class", {
      params: { ID: classroomId }
    });
    const assignments = assignmentRes.data.map(a => ({
      type: "assignment",
      id: a.assignment_id,
      date: new Date(a.creation_date),
      deadline: new Date(a.deadline_date),
      description: a.task_description
    }));

    const announcementRes = await axios.get("http://localhost:3000/announcements/get/class", {
      params: { ID: classroomId }
    });
    const announcements = announcementRes.data.map(a => ({
      type: "announcement",
      id: a.announcement_id,
      date: new Date(a.date_created),
      title: a.title,
      message: a.message
    }));

    // Merge and sort by date descending
    feed.value = [...assignments, ...announcements].sort((a, b) => b.date - a.date);

  } catch (error) {
    console.log("Error loading classroom or feed:", error);
  }
});
</script>

<template>
  <div v-if="classroom">
    <h1>{{ classroom.class_name }}</h1>
    <p>Teacher: {{ classroom.teacher?.username }}</p>

    <button @click="sendAssignments">View assignments</button>
    <br />
    <button v-if="isTeacher" @click="sendAddAnnouncement">New announcement</button>
    <br />
    <button v-if="isTeacher" @click="sendAddAssignment">Add assignments</button>

    <h2>Feed</h2>
      <ul>
        <li
          v-for="item in feed"
          :key="item.type + '-' + item.id"
        >
          <strong v-if="item.type === 'assignment'">New assignment: {{ item.description }}</strong>
          <strong v-else-if="item.type === 'announcement'">New annnouncement: {{ item.title }}</strong><br />

          <span v-if="item.type === 'assignment'">
            Created: {{ item.date.toLocaleDateString() }}<br />
            Deadline: {{ item.deadline.toLocaleString() }}<br />
            <button @click="goAssignment(item.id)">Open Assignment</button>
          </span>

          <span v-else-if="item.type === 'announcement'">
            Posted: {{ item.date.toLocaleString() }}<br />
            Message: {{ item.message }}
          </span>

          <hr />
        </li>
      </ul>

  </div>

  <div v-else>
    <p>Loading classroom info...</p>
  </div>

  <br />
  <BackButton />
</template>