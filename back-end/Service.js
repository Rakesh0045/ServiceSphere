import mysql from "mysql2/promise";
 
const pool = mysql.createPool({
  host: "localhost",     // ✅ only host, no jdbc
  port: 3306,            // ✅ optional, default is 3306
  user: "root",          // your MySQL username
  password: "Rakesh",      // your MySQL password
  database: "kce",       // your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
 
export default pool;