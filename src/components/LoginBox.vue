<script setup>
import axios from "axios";
import { reactive } from "vue";
import router from "@/router";
import { useStore } from "vuex";

const store = useStore();
// State object that stores the response from the server after a login attempt
// as well as the username, password, and permission of the user
const state = reactive({
  // Response from the server
  loginResponse: "",
  // User data
  user: {
    // Username of the user
    username: "",
    // Password of the user
    password: "",
    // Permission level of the user
    permission: "",
  }
})
const handleLogin = async (username, password) => {
  // Create an object with the username and password submitted by the user
  const loginDetails = {
    USERNAME: username,
    PASSWORD: password
  }
  try {
    // Send a POST request to the server with the login details
    const response = await axios.post("http://localhost:3000/login", loginDetails)
    // Set the login response in the state
    state.loginResponse = response.data.message
    // Extract the user and the login token from the response
    const user = response.data.user
    const token = response.data.loginToken
    // Commit the user and token to the Vuex store
    store.commit("setUser", user)
    store.commit("setToken", token)
    // Store the token in local storage
    localStorage.setItem("token", token)
  } catch (error) {
    // Set the login response with the error message
    state.loginResponse = error.response.data.error
  } finally {
    // Check if the login was successful
    if (state.loginResponse === "Login successful") {
      // If it was, redirect to the homepage
      router.push('/')
    } else {
      // If not, do nothing
      console.log("pass")
    }
  }
}
</script>

<template>
    <h2>Login:</h2>
    <input type="text" v-model="state.user.username" placeholder="Enter your username" required>
    <br />  
    <input type="password" v-model="state.user.password" placeholder="Enter your password" required>
    <br /><br />
    <button @click="handleLogin(state.user.username, state.user.password)">Submit</button>
    <p>{{ state.loginResponse }}</p>
</template>