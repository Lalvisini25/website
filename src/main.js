import { createApp } from 'vue'
import App from './App.vue'
import router from "./router"
import { createStore } from "vuex";

const app = createApp(App);

app.use(router);

const store = createStore({
    state: {
        user: {
            id: null,
            username: null,
            password: null,
            permission: null
        },
        token: null,
    },
    mutations: {
        setUser(state, user) {
            state.user = user;
        },
        setToken(state, token) {
            state.token = token;
        }
    },
    actions: {},
    getters: {
        isLoggedIn(state) {
            return !!state.token
        },
        getPermissions(state) {
            return state.user.permission
        },
        getId(state) {
            return state.user.id
        }
    },
})

app.use(store);

app.mount('#app');