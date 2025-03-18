<script setup>
import axios from "axios";
import { ref, reactive } from "vue";

const user = {
  username: ref(""),
  password: ref(""),
  permission: ref(""),
}

const state = reactive({
  signupResponse: {}
});

const handleSignup = async () => {
  const signupDetails = {
    USERNAME: user.username,
    PASSWORD: user.password,
    PERMISSIONS: user.permission,
  }
  try {
    const response = await axios.post("http://localhost:3000/signup", signupDetails);
    console.log(response);
  } catch(error) {
    state.signupResponse = error.response.data;
    console.log(state.signupResponse)
  } finally {
    if (state.signupResponse.message === "Successfully inserted") {
      console.log('Successful signup');
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
    <input type="text" v-model="username" placeholder="Enter your username" required>
    <br />  
    <input type="password" v-model="password" placeholder="Enter your password" required>
    <br />  
    <input type="text" v-model="username" placeholder="Enter your username" required>
    <br /><br />
    <button @click="handleSignup">Submit</button>
    <p>{{ loginResponse }}</p>
    <h4>Hello!</h4>
</template>