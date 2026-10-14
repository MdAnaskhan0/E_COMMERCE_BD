import mysql from 'mysql2/promise';
export const pool = mysql.createPool({
  host: process.env.DB_HOST, port: +process.env.DB_PORT || 3306, user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
  waitForConnections: true, connectionLimit: 10, charset: 'utf8mb4', decimalNumbers: true, dateStrings: ['DATE'], // DATE columns stay 'YYYY-MM-DD' (no timezone shifting)
});
// Always parameterised (?) -> protects against SQL injection
export const q = async (sql, params = []) => (await pool.query(sql, params))[0];
