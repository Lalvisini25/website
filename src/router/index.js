import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import NotFoundView from '@/views/NotFoundView.vue';
import LoginView from '@/views/LoginView.vue';
import AssignmentsView from '@/views/AssignmentsView.vue';
import ChatView from '@/views/ChatView.vue';
import SignupView from '@/views/SignupView.vue';
import AddClassroomView from '@/views/AddClassroomView.vue';
import ClassroomView from '@/views/ClassroomView.vue';
import AddAssignmentView from '@/views/AddAssignmentView.vue';
import StudentAssignmentView from '@/views/StudentAssignmentView.vue';
import ClassAssignmentsView from '@/views/ClassAssignmentsView.vue';
import AddAnnouncementView from '@/views/AddAnnouncementView.vue';
import TeacherAssignmentView from '@/views/TeacherAssignmentView.vue';
import { store } from '@/main.js';
import SubmissionView from '@/views/SubmissionView.vue';
import ResourcesView from '@/views/ResourcesView.vue';
const router = createRouter({
    history: createWebHistory(),
    routes: [
        // Login page
        {
            path: '/login',
            name: 'login',
            component: LoginView
        },
        // Signup page
        {
            path: '/signup',
            name: 'signup',
            component: SignupView
        },
        // Default page
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        // Assignments page
        {
            path: '/assignments',
            name: 'assignments',
            component: AssignmentsView
        },
        // Chat page
        {
            path: '/chat',
            name: 'chat',
            component: ChatView
        },
        // Add classroom page
        {
            path: '/classrooms/add',
            name: 'add-classroom',
            component: AddClassroomView
        },
        // Individual classroom page
        {
            path: '/classrooms/:id',
            name: 'classroom',
            component: ClassroomView
        },
        // Individual assignment page
        {
            path: '/classrooms/:class_id/assignments/:assignment_id',
            name: 'assignment',
            component: StudentAssignmentView,
            // Gets user permissions from store to determine which view to use depending on the user permission
            beforeEnter: (to, from, next) => {
              const role = store.getters.getPermissions
              if (role === 'teacher') {
                to.matched[0].components.default = TeacherAssignmentView
              }
              next()
            }
        },   
        // Page showing all assignments for a classroom
        {
            path: '/classrooms/:class_id/assignments',
            name: 'class-assignments',
            component: ClassAssignmentsView
        },
        // Add assignment page
        {
            path: '/classrooms/:class_id/addAssignment',
            name: 'add-assignment',
            component: AddAssignmentView
        },
        // Add announcement page
        {
            path: '/classrooms/:class_id/addAnnouncement',
            name: 'add-announcement',
            component: AddAnnouncementView
        },
        // Submission page
        {
            path: '/classrooms/:class_id/assignments/:assignment_id/submission/:submission_id',
            name: 'submission',
            component: SubmissionView
        },
        // Resources page
        {
            path: '/classrooms/:class_id/assignments/:assignment_id/resources',
            name: 'resources',
            component: ResourcesView
        },
        // 404 page
        {
            path: '/:catchAll(.*)',
            name: 'not-found',
            component: NotFoundView
        }
    ]
})

export default router;