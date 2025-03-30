import axios from "axios";
import router from "@/router";

export const handleLogin = async (username, password, store) => {
    // Set initial response to empty string
    let loginResponse = "";

    // Create login details object
    const loginDetails = {
      USERNAME: username,
      PASSWORD: password,
    }
    try {
        // Log the login details
        console.log(loginDetails)
        // Post the login details to the /login route
        const response = await axios.post("http://localhost:3000/login", loginDetails);
        // Log the response
        console.log(response);
        // Log the response data
        console.log(response.data)
        // Set the response to the message in the response data
        loginResponse = response.data.message
        // Set the token to the login token in the response data
        const token = response.data.loginToken
        // Set the user to the user in the response data
        const user = response.data.user
        // Log the user data
        console.log("User data:")
        console.log(user, token)
        // Commit the user and token to the store
        store.commit("setUser", user);
        store.commit("setToken", token);
        // Set the token in local storage
        localStorage.setItem("token", token);
    } catch(error) {
        // Set the response to the error message in the error response
        loginResponse = error.response.data.error;
    } finally {
        // Check if the response is successful
        if (loginResponse === "Login successful") {
            // Log that the login was successful
            console.log('Successful login');
            // Redirect the user to the home page
            router.push('/')
        } else {
            // Log that the login was unsuccessful
            console.log("pass");
        }
  
    }

}