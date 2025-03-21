<script setup>

const state = reactive({
    class_name: "",
    colour: "#808080"
})

</script>

<template>
    <h2>Add classroom:</h2>
    <input type="text" v-model="state.class_name" placeholder="Enter class name" required>
    <br />  
    <label for="colour-picker">Choose a color:</label>
    <input type="color" id="colour-picker" v-model="state.colour">
    <br />  


    <label for="pet-select">Choose your role:</label>

    <select v-model="state.user.permission" name="permissions" id="permission-select" required>
      <option value="">Select</option>
      <option value="student">Student</option>
      <option value="teacher">Teacher</option>
      <option value="admin">Admin</option>
    </select>
</template>