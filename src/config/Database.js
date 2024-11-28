import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

class Database {
  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST !== 'production' ? 'localhost' : '0.0.0.0',
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: process.env.MYSQL_PORT,
      // connectionLimit: 10, // Added connection pool limit
      // waitForConnections: true,
      // queueLimit: 0
    });
    this.testConnection = this.testConnection.bind(this);
  }
  async testConnection() {
    try {
      const connection = await this.pool.getConnection();
      console.log('✅ Connected to database as ID:', connection.threadId);
      connection.release();
      return true;
    } catch (err) {
      console.error('❌ Database connection failed:', err);
      return false;
    }
  }
}

export default Database;
