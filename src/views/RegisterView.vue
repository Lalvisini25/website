<script setup>
import axios from "axios";
import { ref, reactive } from "vue";

const user = {
  username: ref(""),
  password: ref(""),
  permission: ref(""),
}

const state = reactive({
  loginResponse: {}
});

const handleLogin = async () => {
  const loginDetails = {
    USERNAME: user.username,
    PASSWORD: user.password,
  }
  try {
    const response = await axios.post("http://localhost:3000/login", loginDetails);
    console.log(response);
  } catch(error) {
    state.loginResponse = error.response.data;
  } finally {
    if (state.loginResponse.message === "Login successful") {
      console.log('Successful login');
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
    <h2>Login:</h2>
    <input type="text" v-model="username" placeholder="Enter your username" required>
    <br />  
    <input type="password" v-model="password" placeholder="Enter your password" required>
    <br /><br />
    <button @click="handleLogin">Submit</button>
    <p>{{ loginResponse }}</p>
    <h4>Hello!</h4>
</template>