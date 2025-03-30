import { api } from './app.js';

// Start the server and listen on the specified port
api.listen(process.env.PORT, () => {
  // Log a message indicating the server is running
  console.log(`Server running on port ${process.env.PORT}`)
})

