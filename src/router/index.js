import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import NotFoundView from '@/views/NotFoundView.vue';
import LoginView from '@/views/LoginView.vue';
import AssignmentsView from '@/views/AssignmentsView.vue';
import ChatView from '@/views/ChatView.vue';
import SignupView from '@/views/SignupView.vue';

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
            path: '/:catchAll(.*)',
            name: 'not-found',
            component: NotFoundView,
        }
    ]
})

export default router