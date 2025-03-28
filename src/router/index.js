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
        {
            path: '/login',
            name: 'login',
            component: LoginView,
        },
        {
            path: '/signup',
            name: 'signup',
            component: SignupView,
        },
        {
            path: '/',
            name: 'home',
            component: HomeView,
        },
        {
            path: '/assignments',
            name: 'assignments',
            component: AssignmentsView,
        },
        {
            path: '/chat',
            name: 'chat',
            component: ChatView,
        },
        {
            path: '/classrooms/add',
            name: 'add-classroom',
            component: AddClassroomView,
        },
        {
            path: '/classrooms/:id',
            name: 'classroom',
            component: ClassroomView,
        },
        {
            path: '/classrooms/:class_id/assignments/:assignment_id',
            name: 'assignment',
            component: StudentAssignmentView, // default
            beforeEnter: (to, from, next) => {
              const role = store.getters.getPermissions;
              if (role === 'teacher') {
                to.matched[0].components.default = TeacherAssignmentView;
              }
              next();
            }
        },   
        {
            path: '/classrooms/:class_id/assignments',
            name: 'class-assignments',
            component: ClassAssignmentsView,
        },
        {
            path: '/classrooms/:class_id/addAssignment',
            name: 'add-assignment',
            component: AddAssignmentView,
        },
        {
            path: '/classrooms/:class_id/addAnnouncement',
            name: 'add-announcement',
            component: AddAnnouncementView,
        },
        {
            path: '/classrooms/:class_id/assignments/:assignment_id/submission/:submission_id',
            name: 'submission',
            component: SubmissionView,
        },
        {
            path: '/classrooms/:class_id/assignments/:assignment_id/resources',
            name: 'resources',
            component: ResourcesView
        },
        {
            path: '/:catchAll(.*)',
            name: 'not-found',
            component: NotFoundView,
        }
    ]
})

export default router