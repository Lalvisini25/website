<script setup>
import axios from "axios";
import { reactive } from "vue";
import { handleLogin } from "@/utils/auth";
import { useStore } from "vuex";

const store = useStore();

const state = reactive({
  signupResponse: "",
  user: {
    username: "",
    password: "",
    permission: "",
  }

});

const handleSignup = async () => {
  const signupDetails = {
    USERNAME: state.user.username,
    PASSWORD: state.user.password,
    PERMISSIONS: state.user.permission,
  }
  try {
    const response = await axios.post("http://localhost:3000/signup", signupDetails);
    console.log(response);
    state.signupResponse = response.data;
    console.log(state.signupResponse.message)
  } catch(error) {
    state.signupResponse = error.response.data;
    console.log(state.signupResponse)
  } finally {
    if (state.signupResponse.message.slice(0,21) === "Successfully inserted") {
      console.log('Successful signup');
      handleLogin(state.user.username, state.user.password, store)
    } else {
      console.log("pass");
  }
  }

  //export state
}

/*
const signup = async () => {
  fetch("http://localhost:3000/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      USERNAME: this.username,
      PASSWORD: this.password,
      PERMISSIONS: this.permission
    })
  })
}
*/
/*
const authenticate = async () => {
  try {
    const response = await axios.get(`http://localhost:3000/token?username=${username}`);
    this.loginResponse = response.data;
  } catch(error) {
    this.loginResponse = error.response.data;
  }
}
*/
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
    <h4>Hello!</h4>
</template>