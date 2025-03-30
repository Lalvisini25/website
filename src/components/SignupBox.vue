<script setup>
import axios from "axios";
import { reactive } from "vue";
import { handleLogin } from "@/utils/auth";
import { useStore } from "vuex";

const store = useStore();

// Create a reactive state object to store signup response and user details
const state = reactive({
  // Response from the server after signup attempt
  signupResponse: "",
  // User data
  user: {
    // Username of the user
    username: "",
    // Password of the user
    password: "",
    // Permission level of the user
    permission: ""
  }
})

const handleSignup = async () => {
  // Check if any of the fields are empty
  if (state.user.username == "" || state.user.password == "" || state.user.permission == "") {
    return state.signupResponse = "Missing fields"
  }

  // Create an object with the signup details
  const signupDetails = {
    USERNAME: state.user.username,
    PASSWORD: state.user.password,
    PERMISSIONS: state.user.permission,
  }

  try {
    // Send a POST request to the server with the signup details
    const response = await axios.post("http://localhost:3000/signup", signupDetails)
    console.log(response)
    state.signupResponse = response.data
    console.log(state.signupResponse.message)
    if (state.signupResponse.message == null) {
      return state.signupResponse = "Username already exists"
    }
  } catch(error) {
    // If there is an error, set the signup response to the error message
    state.signupResponse = error.response.data
    console.log(state.signupResponse)
  } finally {
    // If the signup was successful, call the handleLogin function
    if (state.signupResponse.message.slice(0,21) === "Successfully inserted") {
      console.log('Successful signup')
      handleLogin(state.user.username, state.user.password, store)
    } else {
      console.log("pass")
    }
  }
}
</script>

<template>
    <h2>Signup:</h2>
    <input type="text" v-model="state.user.username" placeholder="Enter your username" required>
    <br />  
    <input type="password" v-model="state.user.password" placeholder="Enter your password" required>
    <br />  

    <label for="pet-select">Choose your role:</label>

    <select v-model="state.user.permission" name="permissions" id="permission-select" required>
      <option value="">Select</option>
      <option value="student">Student</option>
      <option value="teacher">Teacher</option>
      <option value="admin">Admin</option>
    </select>

    <br /><br />
    <button @click="handleSignup">Submit</button>
    <p>{{ state.signupResponse }}</p>
</template>