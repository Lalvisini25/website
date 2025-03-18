<script setup>
import axios from "axios";
import { reactive } from "vue";
import router from "@/router";
import { useStore } from "vuex";

//Creates user object

const store = useStore();

const state = reactive({
  loginResponse: "",
  user: {
    username: "",
    password: "",
    permission: "",
  }

});

const handleLogin = async (username, password) => {
  const loginDetails = {
    USERNAME: username,
    PASSWORD: password,
  }
  try {
    console.log(loginDetails)
    const response = await axios.post("http://localhost:3000/login", loginDetails);
    console.log(response);
    console.log(response.data)
    console.log("asad")
    state.loginResponse = response.data.message
    const token = response.data.loginToken
    const user = response.data.user
    console.log("User data:")
    console.log(user, token)
    store.commit("setUser", user);
    store.commit("setToken", token);
    localStorage.setItem("token", token);
  } catch(error) {
    state.loginResponse = error.response.data.error;
  } finally {
    if (state.loginResponse === "Login successful") {
      console.log('Successful login');
      router.push('/')
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
    <input type="text" v-model="state.user.username" placeholder="Enter your username" required>
    <br />  
    <input type="password" v-model="state.user.password" placeholder="Enter your password" required>
    <br /><br />
    <button @click="handleLogin(state.user.username, state.user.password)">Submit</button>
    <p>{{ state.loginResponse }}</p>
</template>