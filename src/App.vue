<script>
import axios from "axios"

export default {
  data() {
    return {
      username: "",
      password: "",
      permission: "",
      message: "",
      loginResponse: ""
    }
  },
  methods: {
    async login() {
      const loginDetails = {
        USERNAME: this.username,
        PASSWORD: this.password
      }
      console.log("Hey");
      try {
        const response = await axios.post("http://localhost:3000/login", loginDetails);
        this.loginResponse = response.data;
      } catch(error) {
        this.loginResponse = error.response.data;
      }
      if (this.loginResponse.message === "Login successful") {
        this.authenticate(this.username);
      } else {
        console.log("pass")
      }
    } ,

    signup() {
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
    },
    async authenticate(username) {
      try {
        const response = await axios.get(`http://localhost:3000/token?username=${username}`);
        this.loginResponse = response.data;
      } catch(error) {
        this.loginResponse = error.response.data;
      }
    }
  }
}
</script>

<template>
  <h2>Login:</h2>
  <input type="text" v-model="username" placeholder="Enter your username" required>
  <br />  
  <input type="password" v-model="password" placeholder="Enter your password" required>
  <br /><br />
  <button @click="login">Submit</button>
  <p>{{ loginResponse }}</p>
  <h4>Hello!</h4>
</template>

<style scoped>
  h1 {
    color: red
  }
</style>