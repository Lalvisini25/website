import mysql from 'mysql';

// Establishes a connection to the MySQL database
// The connection is exported as a constant and can be imported into other files
export const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
})
