import { createApp } from 'vue'
import App from './App.vue'
import router from "./router"
import { createStore } from "vuex";

const app = createApp(App);

app.use(router);

const store = createStore({
    state: {
        user: null,
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
        }
    },
})

app.use(store);

app.mount('#app');