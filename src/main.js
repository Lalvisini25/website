import { createApp } from 'vue'
import App from './App.vue'
import router from "./router"
import { createStore } from "vuex";

const app = createApp(App);

app.use(router);

export const store = createStore({
    // Define the initial state of the store
    state: {
        user: {
            id: null,
            username: null,
            password: null,
            permission: null
        },
        token: null
    },
    // Define mutations to update the state
    mutations: {
        // Setter for the user
        setUser(state, user) {
            state.user = user
        },
        // Setter for the jwt token
        setToken(state, token) {
            state.token = token
        }
    },
    actions: {
        // Actions can be defined here if needed
    },
    // Define getters to access state properties
    getters: {
        // Returns if the user is logged in based on whether the jwt access token is set
        isLoggedIn(state) {
            return !!state.token
        },
        // Returns the user permissions
        getPermissions(state) {
            return state.user.permission
        },
        // Returns the user id
        getId(state) {
            return state.user.id
        }
    }
})

// Use the Vuex store with the app
app.use(store)

// Mount the app to the DOM element with id 'app'
app.mount('#app')
