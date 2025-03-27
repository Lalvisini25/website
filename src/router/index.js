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
import AssignmentView from '@/views/AssignmentView.vue';
import ClassAssignmentsView from '@/views/ClassAssignmentsView.vue';

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
            component: AssignmentView,
        },
        {
            path: '/classrooms/:class_id/assignments',
            name: 'class-assignments',
            component: ClassAssignmentsView,
        },
        {
            path: '/classrooms/addAssignment/:id',
            name: 'add-assignment',
            component: AddAssignmentView,
        },
        {
            path: '/:catchAll(.*)',
            name: 'not-found',
            component: NotFoundView,
        }
    ]
})

export default router