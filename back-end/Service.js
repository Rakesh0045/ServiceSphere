// import mysql from "mysql2/promise";
 
// const pool = mysql.createPool({
//   host: "localhost",     // ✅ only host, no jdbc
//   port: 3306,            // ✅ optional, default is 3306
//   user: "root",          // your MySQL username
//   password: "Rakesh",      // your MySQL password
//   database: "kce",       // your database name
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });
 
// export default pool;

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Create a connection pool to the database
// This uses the credentials from your .env file
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully!');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

export default pool;
