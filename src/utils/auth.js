import axios from "axios";
import router from "@/router";

export const handleLogin = async (username, password, store) => {

    console.log("awadad")

    let loginResponse = "";

    const loginDetails = {
      USERNAME: username,
      PASSWORD: password,
    }
    try {
        console.log(loginDetails)
        const response = await axios.post("http://localhost:3000/login", loginDetails);
        console.log(response);
        console.log("awaadadsa")
        console.log(response.data)
        console.log("asad")
        loginResponse = response.data.message
        const token = response.data.loginToken
        const user = response.data.user
        console.log("User data:")
        console.log(user, token)
        store.commit("setUser", user);
        store.commit("setToken", token);
        localStorage.setItem("token", token);
    } catch(error) {
        loginResponse = error.response.data.error;
    } finally {
        if (loginResponse === "Login successful") {
            console.log('Successful login');
            router.push('/')
        } else {
            console.log("pass");
        }
  
    }
  
    //export state
  }